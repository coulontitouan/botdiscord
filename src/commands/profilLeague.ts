import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember, Guild, MessageMentions, APIEmbedField, formatEmoji, Snowflake } from "discord.js"
import axios from "axios"
import fs from 'node:fs'
import Vibrant from "node-vibrant"

function customFormatting(id: string, name: string) {
    return formatEmoji({
        id: id as Snowflake,
        name: name,
        animated: false
    });
}
const emojiRank = {
    UNRANKED: customFormatting("1131830384301187132", "unranked"),
    IRON: customFormatting("1131830380379521084", "iron"),
    BRONZE: customFormatting("1131830369965056189", "bronze"),
    SILVER: customFormatting("1131830353431121991", "silver"),
    GOLD: customFormatting("1131830336129601536", "gold"),
    PLATINUM: customFormatting("1131830315153895424", "platinum"),
    EMERALD: customFormatting("1131830295029628948", "emerald"),
    DIAMOND: customFormatting("1131830275228315670", "diamond"),
    MASTER: customFormatting("1131830250398040094", "master"),
    GRANDMASTER: customFormatting("1131830222438797342", "grandmaster"),
    CHALLENGER: customFormatting("1131830194123046952", "challenger"),
}
enum division { I, II, III, IV }
enum rankedName { RANKED_SOLO_5x5, RANKED_FLEX_SR, CHERRY, RANKED_TFT_DOUBLE_UP }

const rankedMode: { [key in rankedName]: { id: string, name: string } } = {
    [rankedName.RANKED_SOLO_5x5]: { id: "RANKED_SOLO_5x5", name: "Solo/Duo Queue" },
    [rankedName.RANKED_FLEX_SR]: { id: "RANKED_FLEX_SR", name: "Classé Flexible" },
    [rankedName.CHERRY]: { id: "CHERRY", name: "Arena" },
    [rankedName.RANKED_TFT_DOUBLE_UP]: { id: "RANKED_TFT_DOUBLE_UP", name: "TFT Double Up" }
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName("profil")
        .setDescription("undefined")
        .addSubcommand(command => command
            .setName("league")
            .setDescription("Donne le profil LoL de l'utilisateur")
            .addStringOption(option => option
                .setName("pseudo")
                .setDescription("Le Riot ID du joueur ou @Discord du joueur, laissez vide si configuré")
                .setRequired(false))
            .addStringOption(option => option
                .setName("tag")
                .setDescription("Le tag du joueur ( par défaut #EUW ) ")
                .setRequired(false)))
        .addSubcommand(command => command
            .setName("config")
            .setDescription("Configure ton compte LoL pour qu'il soit pré-rempli")
            .addStringOption(option => option
                .setName("pseudo")
                .setDescription("Ton Riot ID ( Ex : NGR Faker ) ")
                .setRequired(true))
            .addStringOption(option => option
                .setName("tag")
                .setDescription("Ton tag ( Ex : NGR Faker#EUW ) ")
                .setRequired(false))),
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const guild = interaction.guild as Guild;
        await interaction.deferReply();

        function errorMessage(error: string) {
            return { embeds: [new EmbedBuilder().setColor("#FF0000").setTitle(error)] }
        }
        // La fonction fait appel un API donc sa durée est trop longue pour un simple interaction.reply(), il faut donc le différer

        // Pour récuperer l'entrée texte de la commande
        let pseudo = interaction.options.getString("pseudo") ?? "";
        let tag = interaction.options.getString("tag", false) ?? "EUW";

        // Vérification de la longueur pseudo et tag
        if (!tag.match(/^[A-Za-z\d]{3,5}$/)) {
            return await interaction.editReply(errorMessage("Le tag est incorrect, il doit comporter entre 3 et 5 caratères."))
        } else if (!pseudo.match(/^.{3,16}$/) && !(pseudo.match(MessageMentions.UsersPattern))) {
            return await interaction.editReply(errorMessage("Le pseudo est incorrect, il doit comporter entre 3 et 16 caratères."))
        }

        // Ouvre le fichier contenant les puuid
        const fichier = "./config/configProfil.json";
        let configJSON = require(`.${fichier}`);

        var profil: {
            data: {
                id: string,
                accountId: string,
                puuid: string,
                profileIconId: number,
                revisionDate: number,
                summonerLevel: number
            }
        };
        var profilRiot: {
            data: {
                puuid: string,
                gameName: string,
                tagLine: string
            }
        };
        switch (interaction.options.getSubcommand()) {
            // Sous-commande affichant le profil LoL
            case 'league':
                let idConfig: string;
                // Vérifie si l'entrée texte de l'utilisateur correspond à une entrée dans configProfil.json
                // ou bien à un pseudo LoL et si une information manque, renvoie une erreur
                if (pseudo.length > 0 && pseudo.match(MessageMentions.UsersPattern)) {
                    const idDiscord = pseudo.slice(2, pseudo.length - 1)
                    idConfig = configJSON[idDiscord]
                    if (!idConfig) {
                        try {
                            const pseudoDiscord = await guild.members.fetch(idDiscord);
                            return await interaction.editReply(errorMessage(`${pseudoDiscord.user.username} n'a pas configuré son nom d'invocateur avec /profil config`));
                        } catch {
                            return await interaction.editReply(errorMessage("Cet utilisateur n'existe pas sur Discord."));
                        }
                    }
                    pseudo = tag = "";
                } else {
                    idConfig = configJSON[interaction.user.id]
                }

                if (!pseudo) {
                    if (!idConfig) {
                        return await interaction.editReply(errorMessage("Veuillez remplir un pseudo ou le configurez avec le /profil config"))
                    } else {
                        profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${idConfig}?api_key=${process.env.LOL_API_KEY}`)
                        profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${idConfig}?api_key=${process.env.LOL_API_KEY}`)
                    }
                } else {
                    profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudo}/${tag}?api_key=${process.env.LOL_API_KEY}`)
                    profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${profilRiot.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                    if (profil == undefined) {
                        return await interaction.editReply(errorMessage(`${pseudo}#${tag} n'est pas un pseudo valide.`));
                    }
                }
                // Fin de la vérification 

                // Récupere le champion le plus joué de ce joueur et renvoie une erreur si aucun champion n'a été joué
                const championPref: { data: { championId: number, championLevel: number, championPoints: number }[] } = await axios.get(`https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${profil.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                if (championPref.data[0] === undefined) {
                    return await interaction.editReply(errorMessage(`${pseudo}#${tag} ne semble pas déja avoir joué à LoL pas. Vérifiez l'orthographe`));
                }

                // Récupere le rang et l'image associée au champion préferé
                const rank: {
                    data: {
                        leagueId: string,
                        queueType: string,
                        tier: string,
                        rank: division,
                        summonerId: string,
                        leaguePoints: number,
                        wins: number,
                        losses: number,
                        veteran: boolean,
                        inactive: boolean,
                        freshBlood: boolean,
                        hotStreak: boolean
                    }[]
                } = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${profil.data.id}?api_key=${process.env.LOL_API_KEY}`)
                const image = `https://cdn.communitydragon.org/latest/champion/${championPref.data[0].championId}/tile`

                // Deux fonctions pour la couleur du message
                function componentToHex(c: number) { let hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex }

                function rgbToHex([r, g, b]: number[]) { return Number("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b)) }

                let rgb: number[] = [255, 255, 255]
                await Vibrant.from(image).getPalette((_err, palette) => rgb = palette?.Vibrant?.rgb ?? [255, 255, 255])

                // Début de la constuction du message final
                var embedMessage = new EmbedBuilder()
                    .setAuthor({ name: `${profilRiot.data.gameName}#${profilRiot.data.tagLine}`, iconURL: (`https://cdn.communitydragon.org/latest/profile-icon/${profil.data.profileIconId}`), url: `https://www.op.gg/summoners/euw/${encodeURI(profilRiot.data.gameName)}-${encodeURI(profilRiot.data.tagLine)}` })
                    .setThumbnail(image)
                    .addFields({ name: "Niveau d'invocateur", value: profil.data.summonerLevel.toString() })
                    .setColor(rgbToHex([rgb[0], rgb[1], rgb[2]]))

                // Récuperation des rangs pour chaque mode de jeu
                if (rank.data.length >= 1) {
                    // Tri des rangs
                    rank.data.sort(function (a, b) {
                        const aQueueAsKey = a.queueType as keyof typeof rankedName
                        const bQueueAsKey = b.queueType as keyof typeof rankedName
                        if (rankedName[aQueueAsKey] < rankedName[bQueueAsKey]) return -1
                        if (rankedName[aQueueAsKey] > rankedName[bQueueAsKey]) return 1
                        return 0
                    })
                    // Ajout des rangs au message final
                    for (const rankIndividual of rank.data) {
                        const winrate = Math.round(rankIndividual.wins / (rankIndividual.wins + rankIndividual.losses) * 10000) / 100
                        let field: APIEmbedField = { name: "", value: `${rankIndividual.tier} ${rankIndividual.rank} ${rankIndividual.leaguePoints} LP ${emojiRank[rankIndividual.tier as keyof typeof emojiRank]} ( ${winrate}% de winrate )` }
                        let check = true
                        switch (rankIndividual.queueType) {
                            case rankedMode[rankedName.RANKED_SOLO_5x5].id:
                            case rankedMode[rankedName.RANKED_FLEX_SR].id:
                            case rankedMode[rankedName.RANKED_TFT_DOUBLE_UP].id:
                                field.name = rankedMode[rankedName[rankIndividual.queueType as keyof typeof rankedName]].name;
                                break
                            case rankedMode[rankedName.CHERRY].id:
                                field = { name: rankedMode[rankedName.CHERRY].name, value: winrate + "% de winrate, " + (rankIndividual.wins + rankIndividual.losses) + " parties" }
                                break
                            default:
                                check = false
                        }
                        if (check) {
                            embedMessage.addFields(field)
                        }
                    }
                } else {
                    embedMessage.addFields({ name: "Solo/Duo Queue", value: `Non-classé ${emojiRank.UNRANKED}` })
                }
                return { embeds: [embedMessage] };
            // Sous-commande configurant la première sous-commande
            case 'config':
                // Vérifie si l'entrée texte de l'utilisateur correspond à un pseudo valide
                try {
                    profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudo}/${tag}?api_key=${process.env.LOL_API_KEY}`)
                    profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${profilRiot.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                } catch {
                    return await interaction.editReply(errorMessage(`${pseudo}#${tag} n'est pas un pseudo valide.`));
                }

                if (profil.data.summonerLevel === 1) {
                    return await interaction.editReply(errorMessage(`${pseudo}#${tag} n'a pas encore joué à LoL.`));
                }
                // Fin de la vérification

                // Ajout du pseudo dans le fichier configProfil.json
                configJSON[interaction.user.id] = profil.data.puuid
                fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2))

                // Envoi du message final
                var embedMessage = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle(`Le pseudo ${profilRiot.data.gameName}#${profilRiot.data.tagLine} est validé.`);

                return await interaction.editReply({ embeds: [embedMessage] })
        }
    },
}

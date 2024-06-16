import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember, Guild, MessageMentions, APIEmbedField, formatEmoji, Snowflake, userMention, chatInputApplicationCommandMention } from "discord.js"
import axios from "axios"
import fs from 'node:fs'
import Vibrant from "node-vibrant"
import configJSON from "../../config/configProfil.json" with { type: "json" };
import { errorEmbed } from "../lib/embeds/errorEmbed.js";
import { confirmEmbed } from "../lib/embeds/confirmEmbed.js";
const fichier = "config/configProfil.json";

type ConfigKeys = keyof typeof configJSON;
interface RiotProfile {
    puuid: string,
    gameName: string,
    tagLine: string
}

interface SummonerProfile {
    id: string,
    accountId: string,
    puuid: string,
    profileIconId: number,
    revisionDate: number,
    summonerLevel: number
}
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
export default {
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

        await interaction.deferReply();

        // La fonction fait appel un API donc sa durée est trop longue pour un simple interaction.reply(), il faut donc le différer

        // Pour récuperer l'entrée texte de la commande
        let pseudo = interaction.options.getString("pseudo") ?? userMention(member.id);
        let tag = interaction.options.getString("tag", false) ?? "EUW";

        // Vérification de la longueur pseudo et tag
        let embed;
        if (!pseudo.match(/^.{3,16}$/) && !(pseudo.match(MessageMentions.UsersPattern))) {
            embed = errorEmbed({
                title: "Pseudo incorrect",
                description: "Le pseudo doit comporter entre 3 et 16 caratères."
            })
        } else if (!tag.match(/^[A-Za-z\d]{3,5}$/)) {
            embed = errorEmbed({
                title: "Tag incorrect",
                description: "Le tag doit comporter entre 3 et 5 caratères."
            })
        }

        if (embed) {
            return await interaction.editReply({ embeds: [embed] })
        }

        switch (interaction.options.getSubcommand()) {
            // Sous-commande affichant le profil LoL
            case 'league':
                await this.league(interaction, pseudo, tag);
                break;
            // Sous-commande configurant la première sous-commande
            case 'config':
                await this.config(interaction, pseudo, tag);
                break;
        }
    },
    async config(interaction: ChatInputCommandInteraction, pseudo: string, tag: string) {
        let embed: EmbedBuilder;

        var profil: SummonerProfile | null;
        var profilRiot: RiotProfile | null;

        // Vérifie si l'entrée texte de l'utilisateur correspond à un pseudo valide
        [profilRiot, profil] = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudo}/${tag}?api_key=${process.env.LOL_API_KEY}`)
            .then(async (response) =>
                [
                    response.data,
                    await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${response.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                        .then((response) => response.data)
                ] as [RiotProfile, SummonerProfile]
            )
            .catch(() => [null, null])

        if (!profil || !profilRiot) {
            embed = errorEmbed({
                title: "Combinaison pseudo/tag invalide",
                description: `${pseudo}#${tag} n'est pas un pseudo valide.`
            })
            return await interaction.editReply({ embeds: [embed] })
        }

        if (profil.summonerLevel === 1) {
            embed = errorEmbed({
                title: "Nouveau compte",
                description: `${pseudo}#${tag} n'a jamais joué à LoL.`
            })
            return await interaction.editReply({ embeds: [embed] });
        }
        // Fin de la vérification

        // Ajout du pseudo dans le fichier configProfil.json
        configJSON[interaction.user.id as ConfigKeys] = profil.puuid
        fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2))

        // Envoi du message final
        var embedMessage = confirmEmbed({
            title: `Le pseudo ${profilRiot.gameName}#${profilRiot.tagLine} est validé.`,
            description: `Vous pouvez désormais utiliser la commande ${chatInputApplicationCommandMention("profil", "league", interaction.commandId)} sans préciser de pseudo.`
        })

        return await interaction.editReply({ embeds: [embedMessage] })
    },
    async league(interaction: ChatInputCommandInteraction, pseudo: string, tag: string) {
        const guild = interaction.guild as Guild;

        let idConfig: string;
        let embed: EmbedBuilder;

        var profil: SummonerProfile | null;
        var profilRiot: RiotProfile | null;

        // Vérifie si l'entrée texte de l'utilisateur correspond à une entrée dans configProfil.json
        // ou bien à un pseudo LoL et si une information manque, renvoie une erreur
        if (pseudo.length > 0 && pseudo.match(MessageMentions.UsersPattern)) {
            const idDiscord = pseudo.slice(2, pseudo.length - 1)
            idConfig = configJSON[idDiscord as ConfigKeys]
            if (!idConfig) {
                try {
                    const pseudoDiscord = await guild.members.fetch(idDiscord);
                    embed = errorEmbed({
                        title: "Utilisateur non configuré",
                        description: `${pseudoDiscord.user.username} n'a pas configuré son nom d'invocateur avec ${chatInputApplicationCommandMention("profil", "config", interaction.commandId)}`
                    })
                } catch {
                    embed = errorEmbed({
                        title: "Utilisateur inconnu",
                        description: `${userMention(idDiscord)} n'est pas un utilisateur valide.`
                    })
                }
                return await interaction.editReply({ embeds: [embed] });
            }
            pseudo = tag = "";
        } else {
            idConfig = configJSON[interaction.user.id as ConfigKeys]
        }

        if (!pseudo) {
            if (!idConfig) {
                embed = errorEmbed({
                    title: "Utilisateur non configuré",
                    description: `Veuillez remplir un pseudo ou le configurez avec le ${chatInputApplicationCommandMention("profil", "config", interaction.commandId)}`
                })
                return await interaction.editReply({ embeds: [embed] })
            } else {
                profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${idConfig}?api_key=${process.env.LOL_API_KEY}`).then(response => response.data);
                profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${idConfig}?api_key=${process.env.LOL_API_KEY}`).then(response => response.data);
            }
        } else {
            [profilRiot, profil] = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudo}/${tag}?api_key=${process.env.LOL_API_KEY}`)
                .then(async (response) =>
                    [
                        response.data,
                        await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${response.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                            .then(response => response.data)
                    ] as [RiotProfile, SummonerProfile]
                )
                .catch(() => [null, null])
        }

        if (!profil || !profilRiot) {
            embed = errorEmbed({
                title: "Combinaison pseudo/tag invalide",
                description: `${pseudo}#${tag} n'est pas un pseudo valide.`
            })
            return await interaction.editReply({ embeds: [embed] })
        }
        // Fin de la vérification 

        // Récupere le champion le plus joué de ce joueur et renvoie une erreur si aucun champion n'a été joué
        const championPref: { data: { championId: number, championLevel: number, championPoints: number }[] } = await axios.get(`https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${profil.puuid}?api_key=${process.env.LOL_API_KEY}`)
        if (championPref.data[0] === undefined) {
            embed = errorEmbed({
                title: "Aucun champion joué",
                description: `${pseudo}#${tag} n'a jamais joué à LoL.`
            })
            return await interaction.editReply({ embeds: [embed] });
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
        } = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${profil.id}?api_key=${process.env.LOL_API_KEY}`)
        const image = `https://cdn.communitydragon.org/latest/champion/${championPref.data[0].championId}/tile`

        // Deux fonctions pour la couleur du message
        function componentToHex(c: number) { let hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex }

        function rgbToHex([r, g, b]: number[]) { return Number("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b)) }

        let rgb: number[] = [255, 255, 255]
        await Vibrant.from(image).getPalette((_err: any, palette: any) => rgb = palette?.Vibrant?.rgb ?? [255, 255, 255])

        // Début de la constuction du message final
        var embedMessage = new EmbedBuilder()
            .setAuthor({ name: `${profilRiot.gameName}#${profilRiot.tagLine}`, iconURL: (`https://cdn.communitydragon.org/latest/profile-icon/${profil.profileIconId}`), url: `https://www.op.gg/summoners/euw/${encodeURI(profilRiot.gameName)}-${encodeURI(profilRiot.tagLine)}` })
            .setThumbnail(image)
            .addFields({ name: "Niveau d'invocateur", value: profil.summonerLevel.toString() })
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
                switch (rankIndividual.queueType) {
                    case rankedMode[rankedName.RANKED_SOLO_5x5].id:
                    case rankedMode[rankedName.RANKED_FLEX_SR].id:
                    case rankedMode[rankedName.RANKED_TFT_DOUBLE_UP].id:
                        field.name = rankedMode[rankedName[rankIndividual.queueType as keyof typeof rankedName]].name;
                        break
                    case rankedMode[rankedName.CHERRY].id:
                        field = { name: rankedMode[rankedName.CHERRY].name, value: winrate + "% de winrate, " + (rankIndividual.wins + rankIndividual.losses) + " parties" }
                        break
                }
                if (field.name !== "") {
                    embedMessage.addFields(field)
                }
            }
        } else {
            embedMessage.addFields({ name: "Solo/Duo Queue", value: `Non-classé ${emojiRank.UNRANKED}` })
        }
        return await interaction.editReply({ embeds: [embedMessage] });
    }
}

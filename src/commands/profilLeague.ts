import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember, MessageMentions, APIEmbedField, formatEmoji, Snowflake, userMention, chatInputApplicationCommandMention, Routes, REST } from "discord.js"
import axios from "axios"
import fs from 'node:fs'
import Vibrant from "node-vibrant"
import configJSON from "../../config/configProfil.json" with { type: "json" };
import { errorEmbed } from "../lib/embeds/errorEmbed.js";
import { confirmEmbed } from "../lib/embeds/confirmEmbed.js";
import { LolDleGame } from "../loldleGame.js";
import getCommandId from "../lib/functions/getCommandId.js";
const fichier = "config/configProfil.json";

const axiosInstanceRiot = axios.create({
    headers: { "X-Riot-Token": process.env.LOL_API_KEY }
});

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

interface commandOptions {
    pseudo: string,
    tag: string,
    discordId: string
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

        let pseudo = interaction.options.getString("pseudo") ?? userMention(member.id);
        let tag = interaction.options.getString("tag", false) ?? "EUW";

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
            case 'league':
                embed = await this.league({ pseudo: pseudo, tag: tag, discordId: interaction.user.id });

                return await interaction.editReply({ embeds: [embed] });
            case 'config':
                embed = errorEmbed({
                    description: `Impossible de configurer le pseudo ${pseudo}#${tag}.`
                })
                let res = await this.config({ pseudo: pseudo, tag: tag, discordId: interaction.user.id }, embed);

                if (res) {
                    configJSON[interaction.user.id as ConfigKeys] = res.puuid
                    fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2))

                    embed = confirmEmbed({
                        title: `Le pseudo ${res.gameName}#${res.tagLine} est validé.`,
                        description: `Vous pouvez désormais utiliser la commande ${chatInputApplicationCommandMention("profil", "league", await getCommandId(this.data))} sans préciser de pseudo.`
                    })
                }

                return await interaction.editReply({ embeds: [embed] })
        }
    },
    async config(options: commandOptions, embed: EmbedBuilder): Promise<false | { gameName: string, tagLine: string, puuid: string }> {
        var profil: SummonerProfile | null;
        var profilRiot: RiotProfile | null;

        [profilRiot, profil] = await axiosInstanceRiot.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${options.pseudo}/${options.tag}`)
            .then(async (response) =>
                [
                    response.data,
                    await axiosInstanceRiot.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${response.data.puuid}`)
                        .then((response) => response.data)
                ] as [RiotProfile, SummonerProfile]
            )
            .catch(() => [null, null])

        if (!profil || !profilRiot) {
            embed.setTitle("Combinaison pseudo/tag invalide")
            embed.setDescription(`${options.pseudo}#${options.tag} n'est pas un pseudo valide.`)
            return false;
        }

        if (profil.summonerLevel === 1) {
            embed.setTitle("Nouveau compte")
            embed.setDescription(`${options.pseudo}#${options.tag} n'a jamais joué à LoL.`)
            return false;
        }

        return { gameName: profilRiot.gameName, tagLine: profilRiot.tagLine, puuid: profilRiot.puuid };
    },
    async league(options: commandOptions) {
        let idConfig: string;

        var profil: SummonerProfile | null;
        var profilRiot: RiotProfile | null;

        var mentionCommand = chatInputApplicationCommandMention("profil", "config", await getCommandId(this.data));

        if (options.pseudo.length > 0 && options.pseudo.match(MessageMentions.UsersPattern)) {
            const idDiscord = options.pseudo.slice(2, options.pseudo.length - 1)
            idConfig = configJSON[idDiscord as ConfigKeys]
            if (!idConfig) {
                return errorEmbed(
                    {
                        title: "Utilisateur non configuré",
                        description: `${userMention(idDiscord)} n'a pas configuré son nom d'invocateur avec ${mentionCommand}`
                    }
                )
            }
            options.pseudo = options.tag = "";
        } else {
            idConfig = configJSON[options.discordId as ConfigKeys]
        }

        if (!options.pseudo) {
            if (!idConfig) {
                return errorEmbed(
                    {
                        title: "Utilisateur non configuré",
                        description: `Veuillez remplir un pseudo ou le configurez avec le ${mentionCommand}`
                    }
                )
            } else {
                profilRiot = await axiosInstanceRiot.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${idConfig}`).then(response => response.data);
                profil = await axiosInstanceRiot.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${idConfig}`).then(response => response.data);
            }
        } else {
            [profilRiot, profil] = await axiosInstanceRiot.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${options.pseudo}/${options.tag}`)
                .then(async (response) =>
                    [
                        response.data,
                        await axiosInstanceRiot.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${response.data.puuid}`)
                            .then(response => response.data)
                    ] as [RiotProfile, SummonerProfile]
                )
                .catch(() => [null, null])
        }

        if (!profil || !profilRiot) {
            return errorEmbed(
                {
                    title: "Combinaison pseudo/tag invalide",
                    description: `${options.pseudo}#${options.tag} n'est pas un pseudo valide.`
                }
            );
        }
        // Fin de la vérification 

        // Récupere le champion le plus joué de ce joueur et renvoie une erreur si aucun champion n'a été joué
        const championPref: { data: { championId: number, championLevel: number, championPoints: number, championName: string | undefined }[] } = await axiosInstanceRiot.get(`https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${profil.puuid}`)
        if (championPref.data[0] === undefined) {
            return errorEmbed(
                {
                    title: "Aucun champion joué",
                    description: `${options.pseudo}#${options.tag} n'a jamais joué à LoL.`
                }
            );
        }

        championPref.data[0].championName = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${LolDleGame.version}/data/fr_FR/champion.json`).then(response => {
            for (const champion in response.data.data) {
                if (response.data.data[champion].key == championPref.data[0].championId.toString()) {
                    return response.data.data[champion].id
                }
            }
        })

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
        } = await axiosInstanceRiot.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${profil.id}`)

        const image = `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${championPref.data[0].championName}_0.jpg`

        // Deux fonctions pour la couleur du message
        function componentToHex(c: number) { let hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex }

        function rgbToHex([r, g, b]: number[]) { return Number("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b)) }

        let rgb: number[] = [255, 255, 255]
        await Vibrant.from(image).getPalette((_err: any, palette: any) => rgb = palette?.Vibrant?.rgb ?? [255, 255, 255])

        // Début de la constuction du message final
        let embed = new EmbedBuilder().setAuthor({ name: `${profilRiot.gameName}#${profilRiot.tagLine}`, iconURL: (`https://ddragon.leagueoflegends.com/cdn/${LolDleGame.version}/img/profileicon/${profil.profileIconId}.png`), url: `https://www.op.gg/summoners/euw/${encodeURI(profilRiot.gameName)}-${encodeURI(profilRiot.tagLine)}` })
            .setDescription(null)
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
                    embed.addFields(field)
                }
            }
        } else {
            embed.addFields({ name: "Solo/Duo Queue", value: `Non-classé ${emojiRank.UNRANKED}` })
        }

        return embed;
    }
}

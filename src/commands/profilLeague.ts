import { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, SlashCommandStringOption, GuildMember, Guild, MessageMentions, APIEmbedField } from "discord.js"
import axios from "axios"
import fs from 'node:fs'
import Vibrant from "node-vibrant"
const emojiRank = {
    UNRANKED: "<:unranked:1131830384301187132>",
    IRON: "<:iron:1131830380379521084>",
    BRONZE: "<:bronze:1131830369965056189>",
    SILVER: "<:silver:1131830353431121991>",
    GOLD: "<:gold:1131830336129601536>",
    PLATINUM: "<:platinum:1131830315153895424>",
    EMERALD: "<:emerald:1131830295029628948>",
    DIAMOND: "<:diamond:1131830275228315670>",
    MASTER: "<:master:1131830250398040094>",
    GRANDMASTER: "<:grandmaster:1131830222438797342>",
    CHALLENGER: "<:challenger:1131830194123046952>"
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
        await interaction.deferReply()
        // La fonction fait appel un API donc sa durée est trop longue pour un simple interaction.reply(), il faut donc le différer
        const result = await (async function () {

            // Initialise un message d'erreur
            let embedMessage = new EmbedBuilder()
                .setColor("#FF0000")

            // Pour récuperer l'entrée texte de la commande
            let pseudo = interaction.options.getString("pseudo") ?? "";
            let tag = interaction.options.getString("tag", false) ?? "EUW";

            // Vérification de la longueur pseudo et tag
            if (!tag.match(/^[A-Za-z\d]{3,5}$/)) {
                embedMessage.setTitle("Le tag est incorrect, il doit comporter entre 3 et 5 caratères.");
                return { embeds: [embedMessage] };
            } else if (!pseudo.match(/^.{3,16}$/) && !(pseudo.match(MessageMentions.UsersPattern))) {
                embedMessage.setTitle("Le pseudo est incorrect, il doit comporter entre 3 et 16 caratères.")
                return { embeds: [embedMessage] }
            }

            // Ouvre le fichier contenant les puuid
            const fichier = "./config/configProfil.json"
            let configJSON = require(`.${fichier}`)
            
            // Sous-commande affichant le profil LoL
            switch (interaction.options.getSubcommand()) {
                case 'league':
                    let idConfig, profil, profilRiot
                    // Vérifie si l'entrée texte de l'utilisateur correspond à une entrée dans configProfil.json
                    // ou bien à un pseudo LoL et si une information manque, renvoie une erreur
                    if (pseudo.length > 0) {
                        if (pseudo.match(MessageMentions.UsersPattern)) {
                            const idDiscord = pseudo.slice(2, pseudo.length - 1)
                            idConfig = configJSON[idDiscord]
                            if (!idConfig) {
                                try {
                                    const pseudoDiscord = await guild.members.fetch(idDiscord)
                                    embedMessage.setTitle(`${pseudoDiscord.user.username} n'a pas configuré son nom d'invocateur avec /profil config`)
                                } catch {
                                    embedMessage.setTitle("Cet utilisateur n'existe pas sur Discord.")
                                }
                                return { embeds: [embedMessage] }
                            }
                            pseudo = tag = "";
                        }
                    } else {
                        idConfig = configJSON[interaction.user.id]
                    }

                    if (!pseudo) {
                        if (!idConfig) {
                            embedMessage.setTitle("Veuillez remplir un pseudo ou le configurez avec le /profil config")
                            return { embeds: [embedMessage] }
                        } else {
                            profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${idConfig}?api_key=${process.env.LOL_API_KEY}`)
                            profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${idConfig}?api_key=${process.env.LOL_API_KEY}`)
                        }
                    } else {
                        try {
                            profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudo}/${tag}?api_key=${process.env.LOL_API_KEY}`)
                            profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${profilRiot.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                        } catch {
                            if (profil == undefined) {
                                embedMessage.setTitle(`${pseudo}#${tag} n'est pas un pseudo valide.`)
                                return { embeds: [embedMessage] }
                            }
                        }
                    }
                    // Fin de la vérification 

                    // Récupere le champion le plus joué de ce joueur et renvoie une erreur si aucun champion n'a été joué
                    const championPref: { data: { championId: number, championLevel: number, championPoints: number }[] } = await axios.get(`https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${profil.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                    if (championPref.data[0] === undefined) {
                        embedMessage.setTitle(`${pseudo}#${tag} ne semble pas déja avoir joué à LoL pas. Vérifiez l'orthographe`)
                        return { embeds: [embedMessage] }
                    }

                    // Récupere le rang et l'image associée au champion préferé
                    const rank = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${profil.data.id}?api_key=${process.env.LOL_API_KEY}`)
                    const image = `https://cdn.communitydragon.org/latest/champion/${championPref.data[0].championId}/tile`

                    // Deux fonctions pour la couleur du message
                    function componentToHex(c) { let hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex }

                    function rgbToHex([r, g, b]: number[]) { return Number("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b)) }

                    let rgb: number[] = [255, 255, 255]
                    await Vibrant.from(image).getPalette((_err, palette) => rgb = palette?.Vibrant?.rgb ?? [255, 255, 255])

                    // Début de la constuction du message final
                    embedMessage = new EmbedBuilder()
                        .setAuthor({ name: `${profilRiot.data.gameName}#${profilRiot.data.tagLine}`, iconURL: (`https://cdn.communitydragon.org/latest/profile-icon/${profil.data.profileIconId}`), url: `https://www.op.gg/summoners/euw/${encodeURI(profilRiot.data.gameName)}-${encodeURI(profilRiot.data.tagLine)}` })
                        .setThumbnail(image)
                        .addFields({ name: "Niveau d'invocateur", value: profil.data.summonerLevel.toString() })
                        .setColor(rgbToHex([rgb[0], rgb[1], rgb[2]]))

                    // Récuperation des rangs pour chaque mode de jeu
                    if (rank.data.length >= 1) {
                        const dicoRank = {
                            "RANKED_SOLO_5x5": 1,
                            "RANKED_FLEX_SR": 2,
                            "CHERRY": 3,
                            "RANKED_TFT_DOUBLE_UP": 4
                        }
                        // Tri des rangs
                        rank.data.sort(function (a, b) {
                            if (dicoRank[a.queueType] < dicoRank[b.queueType]) return -1
                            if (dicoRank[a.queueType] > dicoRank[b.queueType]) return 1
                            return 0
                        })
                        // Ajout des rangs au message final
                        for (const rankIndividual of rank.data) {
                            const winrate = Math.round(rankIndividual.wins / (rankIndividual.wins + rankIndividual.losses) * 10000) / 100
                            let field: APIEmbedField = { name: "", value: `${rankIndividual.tier} ${rankIndividual.rank} ${rankIndividual.leaguePoints} LP ${emojiRank[rankIndividual.tier]} ( ${winrate}% de winrate )` }
                            let check = true
                            switch (rankIndividual.queueType) {
                                case "RANKED_SOLO_5x5":
                                    field.name = "Solo/Duo Queue"
                                    break
                                case "RANKED_FLEX_SR":
                                    field.name = "Classé Flexible"
                                    break
                                case "RANKED_TFT_DOUBLE_UP":
                                    field.name = "TFT Double Up"
                                    break
                                case "CHERRY":
                                    field = { name: "Arena", value: winrate + "% de winrate, " + (rankIndividual.wins + rankIndividual.losses) + " parties" }
                                    break
                                default:
                                    check = false
                            }
                            if (check) {
                                embedMessage.addFields(field)
                            }
                        }
                    } else {
                        embedMessage.addFields({ name: "Solo/Duo Queue", value: `Non-classé ${emojiRank["UNRANKED"]}` })
                    }
                    return { embeds: [embedMessage] }
                // Sous-commande configurant la première sous-commande
                case 'config':

                    let profil, profilRiot
                    // Vérifie si l'entrée texte de l'utilisateur correspond à un pseudo valide
                    try {
                        profilRiot = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudo}/${tag}?api_key=${process.env.LOL_API_KEY}`)
                        profil = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${profilRiot.data.puuid}?api_key=${process.env.LOL_API_KEY}`)
                    } catch {
                        embedMessage.setTitle(`${pseudo}#${tag} n'est pas un pseudo valide.`)
                        return { embeds: [embedMessage] }
                    }

                    if (profil.data.summonerLevel === 1) {
                        embedMessage.setTitle(`${pseudo}#${tag} ne semble pas déja avoir joué à LoL pas. Vérifiez l'orthographe`)
                        return { embeds: [embedMessage] }
                    }
                    // Fin de la vérification

                    // Ajout du pseudo dans le fichier configProfil.json
                    configJSON[interaction.user.id] = profil.data.puuid
                    fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2))

                    // Envoi du message final
                    embedMessage.setColor("#00FF00")
                        .setTitle(`Le pseudo ${profilRiot.data.gameName}#${profilRiot.data.tagLine} est validé.`)
                    return { embeds: [embedMessage] }
            }
        })()

        await interaction.editReply(result)
    },
}

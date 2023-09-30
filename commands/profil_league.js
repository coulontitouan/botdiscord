const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const axios = require("axios")
const { tftkey, lolkey } = require("../config/configCode.json")
const fs = require('node:fs')
const Vibrant = require("node-vibrant")
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
        .addSubcommand(subcommand =>
            subcommand
                .setName("league")
                .setDescription("Donne le profil LoL de l'utilisateur")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("Le nom d'invocateur de l'user, laissez vide si configuré")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("config")
                .setDescription("Configure ton compte LoL pour qu'il soit pré-rempli")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("Ton nom d'invocateur ( Ex : NGR Faker ) ")
                        .setRequired(true))),
    async execute(interaction) {

        await interaction.deferReply()
        // La fonction fait appel un API donc sa durée est trop longue pour un simple interaction.reply(), il faut donc le différer
        const result = await (async function () {
            // Pour récuperer l'entrée texte de la commande
            let nomInvovateur = interaction.options.getString("name")

            let embedMessage = new EmbedBuilder()
                .setColor("#FF0000")

            // Ouvre le fichier contenant les puuid
            const fichier = "config/configProfil.json"
            const configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"))

            // Sous-commande affichant le profil LoL
            if (interaction.options.getSubcommand() === 'league') {
                let idConfig, profil
                // Vérifie si l'entrée texte de l'utilisateur correspond à une entrée dans configProfil.json
                // ou bien à un pseudo LoL et si une information manque, renvoie une erreur
                if (nomInvovateur) {
                    if (nomInvovateur.startsWith("<@") && nomInvovateur.endsWith(">") && nomInvovateur.length > 3) {
                        let idDiscord = nomInvovateur.slice(2, nomInvovateur.length - 1)
                        idConfig = configJSON[idDiscord]
                        if (!idConfig) {
                            try {
                                let pseudoDiscord = await interaction.guild.members.fetch(idDiscord)
                                embedMessage.setTitle(`${pseudoDiscord.user.username} n'a pas configuré son nom d'invocateur avec /profil config`)
                            } catch {
                                embedMessage.setTitle("Cet utilisateur n'existe pas sur Discord.")
                            }
                            return { embeds: [embedMessage] }
                        }
                        nomInvovateur = undefined
                    }
                } else {
                    idConfig = configJSON[interaction.user.id]
                }

                if (!nomInvovateur) {
                    if (!idConfig) {
                        embedMessage.setTitle("Veuillez remplir un pseudo ou le configurez avec le /profil config")
                        return { embeds: [embedMessage] }
                    } else {
                        profil = await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" + idConfig + "?api_key=" + lolkey)
                    }
                } else {
                    try {
                        profil = await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + nomInvovateur + "?api_key=" + lolkey)
                    } catch {
                        if (profil == undefined) {
                            embedMessage.setTitle(`${nomInvovateur} n'est pas un pseudo valide.`)
                            return { embeds: [embedMessage] }
                        }
                    }
                }
                // Fin de la vérification 

                // Récupere le champion (personnage) le plus joué de ce joueur et renvoie une erreur si aucun champion n'a été joué
                const championPref = await axios.get("https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + profil.data.id + "?api_key=" + lolkey)
                if (championPref.data[0] == undefined) {
                    embedMessage.setTitle(`${nomInvovateur} ne semble pas déja avoir joué à LoL pas. Vérifiez l'orthographe`)
                    return { embeds: [embedMessage] }
                }

                // Récupere le rang et l'image associée au champion préferé
                const rank = await axios.get("https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + profil.data.id + "?api_key=" + lolkey)
                const image = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/" + championPref.data[0].championId + "/" + championPref.data[0].championId + "000.jpg"

                // Deux fonctions pour la couleur du message
                function componentToHex(c) { let hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex }

                function rgbToHex(r, g, b) { return Number("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b)) }

                await Vibrant.from(image).getPalette((err, palette) => rgb = palette.Vibrant._rgb)

                // Début de la constuction du message final
                embedMessage = new EmbedBuilder()
                    .setAuthor({ name: profil.data.name, iconURL: ("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/" + profil.data.profileIconId + ".jpg"), url: "https://www.op.gg/summoners/euw/" + encodeURI(profil.data.name) })
                    .setThumbnail("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/" + championPref.data[0].championId + "/" + championPref.data[0].championId + "000.jpg")
                    .addFields({ name: "Niveau d'invocateur", value: profil.data.summonerLevel.toString() })
                    .setColor(rgbToHex(rgb[0], rgb[1], rgb[2]))

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
                        let winrate = Math.round(rankIndividual.wins / (rankIndividual.wins + rankIndividual.losses) * 10000) / 100
                        let field = { name: "", value: rankIndividual.tier + " " + rankIndividual.rank + " " + rankIndividual.leaguePoints + " LP " + emojiRank[rankIndividual.tier] + " ( " + winrate + "% de winrate )" }
                        check = true
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
                    embedMessage.addFields({ name: "Solo/Duo Queue", value: "Non-classé" + emojiRank["UNRANKED"] })
                }
                return { embeds: [embedMessage] }
            }
            // Sous-commande configurant la première sous-commande
            if (interaction.options.getSubcommand() === 'config') {

                let profil
                // Vérifie si l'entrée texte de l'utilisateur correspond à un pseudo valide
                try {
                    profil = await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + nomInvovateur + "?api_key=" + lolkey)
                } catch {
                    embedMessage.setTitle(`${nomInvovateur} n'est pas un pseudo valide.`)
                    return { embeds: [embedMessage] }
                }

                if (profil.data.summonerLevel === 1) {
                    embedMessage.setTitle(`${nomInvovateur} ne semble pas déja avoir joué à LoL pas. Vérifiez l'orthographe`)
                    return { embeds: [embedMessage] }
                }
                // Fin de la vérification

                // Ajout du pseudo dans le fichier configProfil.json
                configJSON[interaction.user.id] = profil.data.puuid
                fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2))

                // Envoi du message final
                embedMessage.setColor("#00FF00")
                    .setTitle(`Le pseudo ${profil.data.name} est validé.`)
                return { embeds: [embedMessage] }
            }
        })()

        console.log(JSON.stringify(result))
        await interaction.editReply(result)
    },
}
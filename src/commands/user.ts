import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from "axios";
import fs from 'node:fs';
const emojiTypeActivites = {
    0: '🎮',
    1: '🎥',
    2: '🎧',
    3: '👀',
    5: '🏆'
}
const emojiStatus = {
    online: "<:online:1128728742072692887> En ligne",
    idle: "<:idle:1128728723194122240> Inactif",
    dnd: "<:dnd:1128729048567251115> Ne pas déranger",
    offline: "<:offline:1128728729988898887> Hors-ligne"
}
const emojiActivite = {
    LOL: "<:lol:1128386682513784853>",
    VALORANT: "<:valorant:1128385196329271436>",
    DOFUS: "<:dofus:1128385157775233185>",
    FORTNITE: "<:fortnite:1128385135977435226>",
    SPOTIFY: "<:spotify:1128385218731053087>",
    VSCODE: "<:vscode:1128385181645017289>"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Donne les informations de la personne mentionnée')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Un utilisateur ( Pas obligatoirement sur le serveur, utilise <@idUtilisateur> )')
                .setRequired(false)),
    async execute(interaction) {
        let embed;
        let target = interaction.options.getUser('utilisateur')
        if (!target) {
            target = interaction.member.user
        }

        if (interaction.guild.members.cache.has(target.id)) {
            member = await interaction.guild.members.fetch(target.id)
        }

        if (member) {
            let fichier = "config/configProfil.json"
            let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

            fichier = "config/configPoints.json"
            let configPoints = JSON.parse(fs.readFileSync(fichier, "utf-8"));

            let pseudoLol, activite, rejoint, points;

            if (configJSON[target.id]) {
                let profile = await axios.get("https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/" + configJSON[target.id] + "?api_key=" + process.env.LOL_API_KEY).catch(function (error) { });
                pseudoLol = `${profile.data.gameName}#${profile.data.tagLine}`
            } else {
                pseudoLol = "Non renseigné\nUtilise </profil config:1113512693064814644>"
            }

            if (configPoints[target.id]) {
                points = configPoints[target.id]
            } else {
                points = 0
            }

            if (!member.presence) {
                activite = emojiStatus.offline + "\n"
            } else {
                activite = emojiStatus[member.presence.status] + "\n"
                if (member.presence.activities.length > 0) {
                    member.presence.activities.forEach(function (activity) {
                        if (activity.type == 4) {
                            return;
                        }
                        activite += emojiTypeActivites[activity.type] + " " + activity.name + " "
                        switch (activity.name) {
                            case "League of Legends":
                                if (activity.assets.largeText) {
                                    activite += "( " + activity.assets.largeText
                                    if (activity.details.includes("(")) {
                                        activite += " - " + activity.details.substring(activity.details.indexOf("(") + 1, activity.details.lastIndexOf(")")) + " ) "
                                    } else {
                                        activite += " ) "
                                    }
                                } else if (activity.details.includes("Teamfight Tactics")) {
                                    activite += " ( Teamfight Tactics ) "
                                }

                                activite += emojiActivite.LOL
                                break
                            case "Valorant":
                                activite += emojiActivite.VALORANT
                                break
                            case "Dofus":
                                activite += emojiActivite.DOFUS
                                break
                            case "Fortnite":
                                activite += emojiActivite.FORTNITE
                                break
                            case "Spotify":
                                try {
                                    activite += "( \"" + activity.details + "\" de \"" + activity.state + "\" ) "
                                }
                                catch (e) { }
                                activite += emojiActivite.SPOTIFY
                                break
                            case "Visual Studio Code":
                                activite += emojiActivite.VSCODE
                                break
                        }
                        activite += "\n"
                    })
                }
            }
            rejoint = new Date(target.createdAt - (target.createdAt % 1000) / 1000)
            let rolesList = [];

            for (const i in member._roles) {
                let roleSeul = await member.guild.roles.fetch(member._roles[i])
                rolesList.push(roleSeul)
            }

            rolesList.sort(function (a, b) {
                if (a.rawPosition > b.rawPosition) return -1;
                if (b.rawPosition > a.rawPosition) return 1;
                return 0;
            })

            let roles = "";
            rolesList.forEach((item) => { roles += item.toString() + "\n" })
            embed = new EmbedBuilder()

                .setAuthor({ name: "Profil de " + target.username, iconURL: target.displayAvatarURL() })
                .setThumbnail(member.displayAvatarURL())
                .addFields(
                    { name: "Mention", value: target.toString(), inline: true },
                    { name: "Inscription", value: "<t:" + (rejoint.getTime() - (rejoint.getTime() % 1000)) / 1000 + ":d>", inline: true },
                    { name: "Arrivée", value: "<t:" + (member.joinedAt - (member.joinedAt % 1000)) / 1000 + ":d>", inline: true },
                    { name: "Nom d'invocateur", value: pseudoLol, inline: true },
                    { name: "Points NGR", value: points.toString(), inline: true },
                    { name: "Activité(s)", value: activite, inline: false }
                )
                .setColor(member.displayHexColor)
                .setFooter({ text: "Demandé par " + interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
            if (rolesList.length) {
                embed.addFields(
                    { name: "Roles (" + rolesList.length + ")", value: roles }
                )
            }
        } else {
            let rejoint = new Date(target.createdAt - (target.createdAt % 1000) / 1000)
            embed = new EmbedBuilder()
                .setTitle("Profil de " + target.username)
                .setImage(target.displayAvatarURL())
                .addFields(
                    { name: "Mention", value: target.toString(), inline: true },
                    { name: "Inscription", value: "<t:" + (rejoint.getTime() - (rejoint.getTime() % 1000)) / 1000 + ":d>", inline: true },
                )
                .setColor(await interaction.guild.members.fetch(interaction.client.application.id).then((morde) => { return morde.displayHexColor }));
        }

        interaction.reply({ embeds: [embed] });
    },
};
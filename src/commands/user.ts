import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ColorResolvable, Colors, chatInputApplicationCommandMention } from 'discord.js';
import axios from "axios";
import fs from 'node:fs';
import profilLeague from './profilLeague.js';
import getCommandId from '../lib/functions/getCommandId.js';
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

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Donne les informations de la personne mentionnée')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Un utilisateur ( Pas obligatoirement sur le serveur, utilise <@idUtilisateur> )')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        let embed;
        const target = interaction.options.getUser('utilisateur') ?? interaction.user

        let fichier = "config/configProfil.json"
        const configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

        fichier = "config/configPoints.json"
        const configPoints = JSON.parse(fs.readFileSync(fichier, "utf-8"));

        let pseudoLol, rejoint, points;

        if (configJSON[target.id]) {
            const profile: { data: { puuid: string, gameName: string, tagLine: string } } = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${configJSON[target.id]}?api_key=${process.env.LOL_API_KEY}`);
            pseudoLol = `${profile.data.gameName}#${profile.data.tagLine}`
        } else {
            pseudoLol = `Non renseigné\nUtilise ${chatInputApplicationCommandMention("profil", "config", await getCommandId(profilLeague.data))} pour renseigner ton pseudo.`
        }

        if (configPoints[target.id]) {
            points = configPoints[target.id]
        } else {
            points = 0
        }

        rejoint = new Date(target.createdAt.getTime() - (target.createdAt.getTime() % 1000) / 1000)

        embed = new EmbedBuilder()
            .setAuthor({ name: "Profil de " + target.username, iconURL: target.displayAvatarURL() })
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: "Mention", value: target.toString(), inline: true },
                { name: "Inscription", value: "<t:" + (rejoint.getTime() - (rejoint.getTime() % 1000)) / 1000 + ":d>", inline: true },
                { name: "Nom d'invocateur", value: pseudoLol, inline: true },
                { name: "Points NGR", value: points.toString(), inline: true },
            )
            .setColor((target.hexAccentColor ?? Colors.Default) as ColorResolvable)
            .setFooter({ text: "Demandé par " + interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        interaction.reply({ embeds: [embed] });
    },
};
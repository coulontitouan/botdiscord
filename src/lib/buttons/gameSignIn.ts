import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const gameSignIn = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('inscription')
        .setEmoji('<:lol:1128386682513784853>')
        .setLabel('S\'inscrire')
        .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
        .setCustomId('desinscription')
        .setEmoji('<:lol:1128386682513784853>')
        .setLabel('Se désinscrire')
        .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
        .setCustomId('modifier')
        .setEmoji('🛠️')
        .setLabel('Modifier')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId('rappel')
        .setEmoji('🔔')
        .setLabel('Rappel')
        .setStyle(ButtonStyle.Secondary)
);
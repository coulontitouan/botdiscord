import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const gameSettings = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('start')
        .setEmoji('▶️')
        .setLabel('Lancer')
        .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
        .setCustomId('cancel')
        .setEmoji('🗑️')
        .setLabel('Supprimer')
        .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
        .setCustomId('setHeure')
        .setEmoji('⏲')
        .setLabel('Changer l\'heure')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId('annuler')
        .setEmoji('<:cancel:1200121851024769144>')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary)
);
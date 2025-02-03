import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBooleanOption, SlashCommandAttachmentOption } from 'discord.js';
import fs from "fs";
import { Scopes } from '../constants.js';

export default {
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Permet d\'upload un fichier sur livreur.ovh')
        .addAttachmentOption(option => option
            .setName('fichier')
            .setDescription('Le fichier à upload sur le CDN.')
            .setRequired(true)
        ),
    scope: Scopes.RATIO,
    async execute(interaction: ChatInputCommandInteraction) {
        console.log(interaction.options.get('fichier', true))
        interaction.reply({
            content: `Seuls les admins peuvent désactiver le debanmoi.`,
            ephemeral: true
        })
    },
}
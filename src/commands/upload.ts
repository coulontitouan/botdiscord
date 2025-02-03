import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBooleanOption, SlashCommandAttachmentOption, Attachment } from 'discord.js';
import { Scopes } from '../constants.js';
import fs from "fs";
import axios from "axios"
import path from 'path';

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
        const attachment = interaction.options.get('fichier', true).attachment as Attachment
        
        if (attachment.size > 52428800) {
            return interaction.reply({
                content: `Le fichier est trop lourd. (max 50Mo)`,
                ephemeral: true
            })
        }

        const url = attachment.url
        const filename = attachment.name
        const contentType = attachment.contentType ? attachment.contentType.split(';')[0] : "unknown"

        const outputPath = path.join("/app/files", contentType, filename);
        // const outputPath = path.join('files', contentType, filename);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        console.log(outputPath)
        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }

        await interaction.reply({
            content: `Upload en cours...`,
            ephemeral: true
        });

        try {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(undefined));
                writer.on('error', reject);
            });

            interaction.editReply({
                content: `Le fichier a été uploadé avec succès.`,
            });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: `Une erreur s'est produite lors de l'upload du fichier.`,
            });
        }

        return
    },
}

import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBooleanOption, SlashCommandAttachmentOption, Attachment } from 'discord.js';
import { Scopes } from '../constants.js';
import fs from "fs";
import axios from "axios"
import path from 'path';
import { errorEmbed } from '../lib/embeds/errorEmbed.js';
import { confirmEmbed } from '../lib/embeds/confirmEmbed.js';
import { informationEmbed } from '../lib/embeds/informationsEmbed.js';

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
        const cdnLink = 'https://cdn.livreur.ovh';

        let embed = informationEmbed({
            title: 'Upload en cours',
            description: 'Fichier en cours d\'envoi, attends un peu...'
        })
        await interaction.reply({ embeds: [embed] });

        if (attachment.size > 52428800) {
            embed = errorEmbed({
                title: 'Fichier trop lourd (comme Noam)',
                description: 'Le fichier est trop lourd. (max 50Mo)'
            })
            return await interaction.editReply({ embeds: [embed] });
        }

        const url = attachment.url
        const filename = attachment.name
        const contentType = attachment.contentType ? attachment.contentType.split(';')[0] : "unknown"
        const newLink = `Lien: [${filename}](${cdnLink}/${path.join(contentType, filename)}`;

        const outputPath = path.join("/app/files", contentType, filename);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        if (fs.existsSync(outputPath)) {
            embed = errorEmbed({
                title: 'Fichier déjà existant',
                description: `Le fichier existe déjà sur le CDN, renomme ton fichier. ${newLink})`
            })
            return await interaction.editReply({ embeds: [embed] });
        }

        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }

        try {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(undefined));
                writer.on('error', reject);
            });

            embed = confirmEmbed({
                title: 'Upload réussi',
                description: `Le fichier a été upload avec succès. ${newLink})`
            })
            return await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            embed = errorEmbed({
                title: 'Erreur lors de l\'upload',
                description: 'Une erreur est survenue lors de l\'upload du fichier.'
            })
            return await interaction.editReply({ embeds: [embed] });
        }
    },
}

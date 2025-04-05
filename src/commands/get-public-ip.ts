import { CommandInteraction } from 'discord.js';
import { readFile } from 'fs/promises';

export default {
    data: new SlashCommandBuilder()
        .setName('get-public-ip')
        .setDescription("Renvoie l'adresse IP publique du serveur"),
    async execute(interaction: CommandInteraction) {
        try {
            const filePath = `${process.env.HOME}/public_ip`;
            const publicIp = await readFile(filePath, 'utf-8');
            await interaction.reply(`Contenu de ~/public_ip :\n${publicIp}`);
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier public_ip:', error);
            await interaction.reply('Impossible de lire le fichier ~/public_ip.');
        }
    },
};
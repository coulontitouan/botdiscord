const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Donne le classement des membres du serveur selon leurs points NGR.'),
    async execute(interaction) {
        interaction.reply("pas encore faite")
    },
};
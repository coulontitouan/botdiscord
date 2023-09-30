const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Donne le classement des membres du serveur selon leurs points NGR.'),
    async execute(interaction) {

            // Vérifie si le serveur est le bon
            if (interaction.member.guild.id != "1017742904753655828") {
                await interaction.reply({ content: "Mauvais serveur", ephemeral: true })
                return
            }

        interaction.reply("pas encore faite")
    },
};
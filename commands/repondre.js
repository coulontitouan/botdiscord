const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repondre')
        .setDescription('Permet de répondre au mini-jeu d\'Anthony')
        .addStringOption(option =>
            option.setName('champion')
                .setDescription('Le nom du champion')
                .setRequired(true)
                .setAutocomplete(true)),
    async execute(interaction) {
        // Récupere les 100 derniers messages du salon
        const messagesHistory = await interaction.channel.messages.fetch({ limit: 100 })

        interaction.reply({
            content: `Pas encore fini chef`,
            ephemeral: false
        })
    },
}
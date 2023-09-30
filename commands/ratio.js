const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ratio')
        .setDescription('Ratio le dernier message de la personne mentionnée')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Le nom de l\'utilisateur a ratio')
                .setRequired(true)),
    async execute(interaction) {
        // Récupere les 100 derniers messages du salon
        const messagesHistory = await interaction.channel.messages.fetch({ limit: 100 })

        let target = interaction.options.getUser('utilisateur')

        // Dès que le message vient de "target" on envoie "ratio"
        for (const message of messagesHistory.values()) {

            if (message.author == target) {

                message.reply('ratio').then(sentRatio => {
                    sentRatio.react("❤️")
                })

                interaction.reply({
                    content: `Ratio sur ${target}`,
                    ephemeral: true
                })

                console.log(`Ratio de ${interaction.user.tag} sur ${target.tag}`)

                return
            }
        }

        interaction.reply({
            content: `L'utilisateur ${target} n'a pas été trouvé... \n Il faut que le message soit dans les 100 derniers messages du salon`,
            ephemeral: false
        })
    },
}
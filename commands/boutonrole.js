const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boutonrole')
        .setDescription('Créer le bouton role'),
    async execute(interaction) {

        if (!interaction.member.permissions.has('Administrator')) {
            await interaction.reply({ content: "T'as pas les perms bg", ephemeral: true })
            return
        }

        const boutons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('boutonngr')
                    .setLabel('Devenir un vrai NGR')
                    .setStyle(ButtonStyle.Primary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('boutonjuif')
                    .setLabel('Devenir un juif')
                    .setStyle(ButtonStyle.Danger)
            );
            
        const message = new EmbedBuilder()
            .setTitle("Rôles du serveur")
            .setDescription("Click sur les rôles que tu veux obtenir sur le serveur")
            .setThumbnail("https://i.imgur.com/hdOhUoh.png")
            .setColor(0x2B2D31)
            .addFields({ name: "NGR E-Sports", value: "La meilleure équipe du monde dans les catégories \"Manque de joueurs\" et \"Éclatée au sol\"." })
            .addFields({ name: "Juif", value: "Bah, tu deviens juif..." })

        await interaction.reply({ embeds: [message], components: [boutons] })
    }
}
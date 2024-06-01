import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction, CommandInteraction, ChatInputCommandInteraction, ButtonComponent, ComponentType, TextInputBuilder, PermissionFlagsBits, Permissions, PermissionsBitField, GuildMember } from 'discord.js'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boutonrole')
        .setDescription('Créer le bouton role'),

    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const permissions = member.permissions as PermissionsBitField;
        
        // Vérifie si l'utilisateur a les permissions
        if (permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "Permissions manquantes : Administrateur", ephemeral: true })
            return
        }

        // Vérifie si le serveur est le bon
        if (member.guild.id != "1017742904753655828") {
            await interaction.reply({ content: "Mauvais serveur", ephemeral: true })
            return
        }

        const boutonngr = new ButtonBuilder()
            .setCustomId('boutonngr')
            .setLabel('Devenir un vrai NGR')
            .setStyle(ButtonStyle.Primary)

        const boutonjuif = new ButtonBuilder()
            .setCustomId('boutonjuif')
            .setLabel('Devenir un juif')
            .setStyle(ButtonStyle.Primary)

        // Crée les boutons 
        const boutons = new ActionRowBuilder()
            .addComponents(
                boutonngr,boutonjuif
            )

        // Crée l'"embed" message 
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
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField, GuildMember } from 'discord.js'
import { AdminEmbed, WrongGuildEmbed, GUILD_ID } from '../constants.js';

export default {
    data: new SlashCommandBuilder()
        .setName('boutonrole')
        .setDescription('Créer le bouton role'),
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const permissions = member.permissions as PermissionsBitField;
        
        if (!permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ embeds: [AdminEmbed], ephemeral: true })
        }

        if (member.guild.id !== GUILD_ID) {
            return await interaction.reply({ embeds: [WrongGuildEmbed], ephemeral: true })
        }

        // Crée les boutons 
        const boutonngr = new ButtonBuilder()
            .setCustomId('boutonngr')
            .setLabel('Devenir un vrai NGR')
            .setStyle(ButtonStyle.Primary)

        const boutonjuif = new ButtonBuilder()
            .setCustomId('boutonjuif')
            .setLabel('Devenir un juif')
            .setStyle(ButtonStyle.Danger)

        const boutons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                boutonngr, boutonjuif
            );

        // Crée l'"embed" message 
        const message = new EmbedBuilder()
            .setTitle("Rôles du serveur")
            .setDescription("Click sur les rôles que tu veux obtenir sur le serveur")
            .setThumbnail("https://i.imgur.com/hdOhUoh.png")
            .setColor(0x2B2D31)
            .addFields({ name: "NGR E-Sports", value: "La meilleure équipe du monde dans les catégories \"Manque de joueurs\" et \"Éclatée au sol\"." })
            .addFields({ name: "Juif", value: "Bah, tu deviens juif..." });

        await interaction.reply({ embeds: [message], components: [boutons] });
    }
}
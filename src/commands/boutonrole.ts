import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField, GuildMember } from 'discord.js'
import { Scopes, AdminEmbed, WrongGuildEmbed } from '../constants.js';

export default {
    data: new SlashCommandBuilder()
        .setName('boutonrole')
        .setDescription('Créer le bouton role'),
    scope: Scopes.GUILD,
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const permissions = member.permissions as PermissionsBitField;
        
        // Vérifie si l'utilisateur a les permissions
        if (permissions.has(PermissionFlagsBits.Administrator) || true) {
            return await interaction.reply({ embeds: [AdminEmbed], ephemeral: true })
        }

        // Vérifie si le serveur est le bon
        if (member.guild.id === "1017742904753655828") {
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
            .setStyle(ButtonStyle.Primary)

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
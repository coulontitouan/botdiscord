import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Guild, NonThreadGuildBasedChannel, ChannelType, userMention } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Donne les informations sur le serveur'),
    async execute(interaction: ChatInputCommandInteraction) {

        // Récupere le serveur et le bot
        const guild = interaction.guild as Guild
        let bot = await guild.members.fetch(interaction.client.application.id)

        // Compte les salons sans les catégories
        let countChannel = 0
        let salonsRaw = (await guild.channels.fetch())

        salonsRaw.forEach(ch => {
            if (ch && ch.type != ChannelType.GuildCategory) {
                countChannel += 1
            }
        })

        // Construction du message final
        let embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setDescription("Membres : " + guild.memberCount + "\n"
                + "Salons : " + countChannel + "\n"
                + "Propriétaire : " + userMention(guild.ownerId) + "\n"
            )
            .setThumbnail(guild.iconURL())
            .setColor(bot.displayHexColor)

        let wyatt = await bot.guild.members.fetch('599524864692584454').then(w => embed.setFooter({ text: "Il est où Wyatt ?", iconURL: w.user.displayAvatarURL() }))

        return interaction.reply({ embeds: [embed] })
    },
};
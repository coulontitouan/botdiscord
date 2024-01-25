const { SlashCommandBuilder, time, channelMention, roleMention, EmbedBuilder, userMention, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("game")
        .setDescription("undefined")
        .addSubcommand(subcommand =>
            subcommand
                .setName("lol")
                .setDescription("Organise une partie sur LoL.")
                .addStringOption(option =>
                    option.setName("type")
                        .setDescription("Type de partie")
                        .addChoices(
                            { name: 'Flex', value: 'Flex' },
                            { name: 'Clash', value: 'Clash' },
                            { name: 'Personnalisée', value: 'Personnalisée' },
                            { name: 'Arena', value: 'Arena' },
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName("ping")
                        .setDescription("Ping le rôle LoL ?")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName("date_heure")
                        .setDescription("Date et heure de la partie (format : jj/mm/aaaa hh:mm)")
                        .setRequired(false)
                )
                .addChannelOption(option =>
                    option
                        .setName("salon")
                        .setDescription("Salon du rendez-vous")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildVoice)
                )
        ),

    async execute(interaction) {

        // Vérifie si le serveur est le bon
        if (interaction.member.guild.id != "1017742904753655828") {
            await interaction.reply({ content: "Mauvais serveur", ephemeral: true })
            return
        }

        const mode = interaction.options.getString("type")
        const ping = interaction.options.getBoolean("ping")
        const salon = interaction.options.getChannel("salon")
        const date_heure = interaction.options.getString("date_heure")

        function parseDateString(dateString) {
            try {
                const [day, month, yearHour] = dateString.split('/');
                const [year, hourMinute] = yearHour.split(' ');
                const [hour, minute] = hourMinute.split(':');
                const parsedDate = new Date(year, month - 1, day, hour, minute);
                return parsedDate;
            } catch {
                return null;
            }
        }

        const bot = await interaction.guild.members.fetch(interaction.client.application.id)

        const timestamp = time(parseDateString(date_heure)) ? time(parseDateString(date_heure)) : "Aucune date renseignée"
        const fields = []
        fields.push({ name: " - Type de partie :", value: mode })
        date_heure ? fields.push({ name: " - Date et heure :", value: timestamp }) : {}
        salon ? fields.push({ name: " - Salon :", value: `${channelMention(`${salon.id}`)}` }) : {}
        fields.push({ name: " - Inscrits :", value: `${userMention(`${interaction.member.user.id}`)}\n` })

        const boutons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setEmoji('<:lol:1128386682513784853>')
                .setLabel('Confirmer')
                .setStyle(ButtonStyle.Primary)
        )

        let embed = new EmbedBuilder()
            .setTitle(`${interaction.member.user.username} organise une partie sur LoL !`)
            .setColor(bot.displayHexColor)
            .addFields(fields)
            .setFooter({ text: `Ping rôle : ${ping}`})

        switch (mode) {
            case "flex":
                break
        }

        return interaction.reply({ content: `Confirmation le ${timestamp} en ${mode} dans le salon ${salon} ?`, ephemeral: true, embeds: [embed], components: [boutons] })
        return interaction.reply({ content: "En cours de développement", ephemeral: true })
    }
}
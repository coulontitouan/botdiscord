const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption, Guild, ChannelType } = require('discord.js')

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
                            { name: 'Flex', value: 'flex' },
                            { name: 'Clash', value: 'clash' },
                            { name: 'Personnalisée', value: 'perso' },
                        )
                )
                .addBooleanOption(option =>
                    option
                        .setName("ping")
                        .setDescription("Ping le rôle LoL ?")
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

        return interaction.reply({ content: "En cours de développement", ephemeral: true })
        // Vérifie si le serveur est le bon
        if (interaction.member.guild.id != "1017742904753655828") {
            await interaction.reply({ content: "Mauvais serveur", ephemeral: true })
            return
        }

        let heure = interaction.options.getString("heure")
        let jour = interaction.options.getString("jour")

        return interaction.reply({ content: `${heure} ${jour}`, ephemeral: true })
    }
}
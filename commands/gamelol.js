const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption } = require('discord.js')

var subOptions = [
    new SlashCommandStringOption()
        .setName("heure")
        .setDescription("L'heure de la partie ( Ex : 20h10 )")
        .setRequired(true),
    new SlashCommandStringOption()
        .setName("jour")
        .setDescription("Le jour de la partie ( Ex : 12/02 ), par défaut aujourd'hui.")
        .setRequired(false),
    new SlashCommandBooleanOption()
        .setName("ping")
        .setDescription("Ping le rôle LoL ?")
        .setRequired(false)]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("game")
        .setDescription("undefined")
        .addSubcommand(subcommand => {
            subcommand
                .setName("flex")
                .setDescription("Organise un partie en flex.")
            subcommand.options = subOptions
            return subcommand
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName("perso")
                .setDescription("Organise un partie personnalisée.")
            subcommand.options = subOptions
            return subcommand
        }),

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
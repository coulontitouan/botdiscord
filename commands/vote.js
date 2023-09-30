const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Crée un vote ')
        .addStringOption(option =>
            option.setName('intitule')
                .setDescription('L\'intitulé du sondage')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('La première option du vote (Plutôt oui)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('La seconde option du vote (Plutôt non)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('La troisième option du vote')
                .setRequired(false)),
                
    async execute(interaction) {
        let embed
        if (!interaction.options.getString('option3')) {
            // Crée un message de vote à 2 possibilités
            embed = new EmbedBuilder()
                .setTitle(interaction.options.getString('intitule'))
                .setThumbnail('https://raw.githubusercontent.com/coulontitouan/botdiscord/main/static/vote2opt.jpg')
                .addFields(
                    { name: interaction.options.getString('option1'), value: '✅', inline: true },
                    { name: interaction.options.getString('option2'), value: '❌', inline: true },
                )
                .setColor(0xFFFFFF)
        } else {
            // Crée un message de vote à 3 possibilités
            embed = new EmbedBuilder()
                .setTitle(interaction.options.getString('intitule'))
                .setThumbnail('https://raw.githubusercontent.com/coulontitouan/botdiscord/main/static/vote3opt.jpg')
                .addFields(
                    { name: interaction.options.getString('option1'), value: '1️⃣' },
                    { name: interaction.options.getString('option2'), value: '2️⃣' },
                    { name: interaction.options.getString('option3'), value: '3️⃣' },
                )
                .setColor(0xFFFFFF)
        }
        // Envoi du message
        interaction.reply({ embeds: [embed] })
    },
};
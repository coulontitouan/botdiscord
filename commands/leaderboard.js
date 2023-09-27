const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Donne les informations de la personne mentionnée')
    	.addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Un utilisateur')
    			.setRequired(true)),
	async execute(interaction) {
        var target = interaction.options.getUser('utilisateur')

        console.log(target)
        console.log(target.displayAvatarURL())
        var embed =  new EmbedBuilder()
        .setTitle("feur")
        .setImage(target.displayAvatarURL({
            dynamic: true, format : "gif" 
         }));
        // .addFields(
        //     { name: interaction.options.getString('option1'), value: '✅', inline: true },
        //     { name: interaction.options.getString('option2'), value: '❌', inline: true },
        // );
        interaction.reply(target.displayAvatarURL());
	},
};
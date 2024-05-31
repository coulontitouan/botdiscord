const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spam')
		.setDescription('Spam un utilisateur')
    	.addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Le nom de l\'utilisateur a spam')
    			.setRequired(true)),
	async execute(interaction) {
        interaction.reply("pas encore faite")
	},
};
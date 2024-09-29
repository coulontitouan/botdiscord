import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('spam')
		.setDescription('Spam un utilisateur')
    	.addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Le nom de l\'utilisateur a spam')
    			.setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply("pas encore faite")
	},
};
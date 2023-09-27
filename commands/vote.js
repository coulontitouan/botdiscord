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
        if(!interaction.options.getString('option3')){
            var embed =  new EmbedBuilder()
            .setTitle(interaction.options.getString('intitule'))
            .setThumbnail('https://i.imgur.com/mPbkGEu.jpg')
            .addFields(
                { name: interaction.options.getString('option1'), value: '✅', inline: true },
                { name: interaction.options.getString('option2'), value: '❌', inline: true },
            )
            .setColor(0xFFFFFF);
        }else{
            var embed =  new EmbedBuilder()
            .setTitle(interaction.options.getString('intitule'))
            .setThumbnail('https://i.postimg.cc/tCTmtJqh/image.png')
            .addFields(
                { name: interaction.options.getString('option1'), value: '1️⃣' },
                { name: interaction.options.getString('option2'), value: '2️⃣' },
                { name: interaction.options.getString('option3'), value: '3️⃣' },
            )
            .setColor(0xFFFFFF);
        }
        interaction.reply({embeds: [embed]})
	},
};
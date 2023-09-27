const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serveur')
		.setDescription('Donne les informations sur le serveur'),
	async execute(interaction) {
        const guild = interaction.guild
        mordekaiser = await interaction.guild.members.fetch(interaction.client.application.id)
        var salonsRaw = await guild.channels.fetch()
        var countChannel = 0
        salonsRaw.forEach(ch => {
                if(ch.type != 4){
                    countChannel += 1
                }
            }
        )
        embed = new EmbedBuilder()
        .setTitle(guild.name)
        .setDescription("Membres : " + guild.memberCount + "\n" 
                        + "Salons : " + countChannel + "\n" 
                        + "Propriétaire : " + "<@" + guild.ownerId + ">" + "\n"
        )
        .setThumbnail(guild.iconURL())
        .setColor(mordekaiser.displayHexColor)
        try{
            var wyatt = await mordekaiser.guild.members.fetch('599524864692584454')
            embed.setFooter({ text: "Il est où Wyatt ?", iconURL: wyatt.user.displayAvatarURL() });
        }
        catch(e){}

        interaction.reply({embeds: [embed]})
	},
};
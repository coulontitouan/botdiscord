const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelSelectMenuOptionBuilder } = require('discord.js');
const { lolkey } = require("../config/configCode.json");
const axios = require('axios');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Ouvre le menu d\'archive si le mot de passe est correct')
    	.addIntegerOption(option =>
            option.setName('motdepasse')
                .setDescription('Le mot de passe de la commande')
    			.setRequired(true)),
	async execute(interaction) {

        var championId = 90; //Malzahar
        
        var fichier = "config/configProfil.json"
        configJSON = JSON.parse(fs.readFileSync(fichier,"utf-8"));
        livreuruuid = configJSON["524926551431708674"]

        profile = await axios.get("https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/" + livreuruuid + "/by-champion/" + championId + "?api_key=" + lolkey)

        points = profile.data.championPoints

        if(points !== interaction.options.getInteger('motdepasse')){
            interaction.reply("Mauvais mot de passe.")
        }
        else{

            let archiveid = 1151532178056949920
            const guild = interaction.guild
            
            embed = new EmbedBuilder()

            salonRaw = await guild.channels.fetch()//1151532178056949920

            var salonsArchives = ""
            
            salonRaw.get("1151532178056949920").children.cache.forEach(salon => {
                salonsArchives += salon.name + "\n"
            });
            embed.addFields({name:"Salons archivés : ", value:salonsArchives})
            //console.log(salonRaw)

            const select = new ChannelSelectMenuBuilder()
			.setCustomId('salon')
			.setPlaceholder('Make a selection!')

            
            var menu = new ActionRowBuilder()
            .addComponents(select);
            

            interaction.reply({
                embeds:[embed], 
                components:[menu]
            });
        }
	},
};
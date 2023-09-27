const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require("axios");
const fs = require('node:fs');
const { lolkey } = require("../config/configCode.json");
const emojiTypeActivites = {
    0: '🎮',
    1: '🎥',
    2: '🎧',
    3: '👀',
    5: '🏆'
}
const emojiStatus = {
    online: "<:online:1128728742072692887> En ligne",
    idle: "<:idle:1128728723194122240> Inactif",
    dnd: "<:dnd:1128729048567251115> Ne pas déranger",
    offline: "<:offline:1128728729988898887> Hors-ligne"
}
const emojiActivite = {
    LOL : "<:lol:1128386682513784853>",
    VALORANT : "<:valorant:1128385196329271436>",
    DOFUS : "<:dofus:1128385157775233185>",
    FORTNITE : "<:fortnite:1128385135977435226>",
    SPOTIFY : "<:spotify:1128385218731053087>",
    VSCODE : "<:vscode:1128385181645017289>"
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Donne les informations de la personne mentionnée')
    	.addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Un utilisateur ( Pas obligatoirement sur le serveur, utilise <@idUtilisateur> )')
    			.setRequired(false)),
	async execute(interaction) {
        // await interaction.deferReply();
        // var result = await commande();
        // await interaction.editReply(result);
        // //interaction.reply(await commande())
        // async function commande() {
            var target = interaction.options.getUser('utilisateur')
            if(!target){
                target = interaction.member.user
            }

            if(interaction.guild.members.cache.has(target.id)){
                var member;
                var member = await interaction.guild.members.fetch(target.id)
            }
            
            if(member){
                var fichier = "config/configProfil.json"
                configJSON = JSON.parse(fs.readFileSync(fichier,"utf-8"));
                
                fichier = "config/configPoints.json"
                configPoints = JSON.parse(fs.readFileSync(fichier,"utf-8"));

                var nom, pseudoLol, activite, rejoint, rejointServ, points;
                if(member.nickname){
                    nom = member.nickname
                }else{
                    nom = target.username
                }

                if(configJSON[target.id]){
                    profile =  await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" + configJSON[target.id] + "?api_key=" + lolkey).catch(function (error){});
                    pseudoLol = profile.data.name
                }else{
                    pseudoLol = "Non renseigné\nUtilise </profil config:1113512693064814644>"
                }

                if(configPoints[target.id]){
                    points = configPoints[target.id]
                }else{
                    points = 0
                }

                if(!member.presence){
                    activite = emojiStatus.offline + "\n"
                }else{
                    activite = emojiStatus[member.presence.status] + "\n"
                    if(member.presence.activities.length > 0){
                        member.presence.activities.forEach(function (activity) {
                            if(activity.type == 4){
                                return;
                            }
                            activite += emojiTypeActivites[activity.type] + " " + activity.name + " "
                            switch(activity.name){
                                case "League of Legends":
                                    if(activity.assets.largeText){
                                        activite += "( " + activity.assets.largeText
                                        if(activity.details.includes("(")){
                                            activite += " - " + activity.details.substring(activity.details.indexOf("(") + 1,activity.details.lastIndexOf(")")) + " ) "
                                        }else{
                                            activite += " ) "
                                        }
                                    }else if (activity.details.includes("Teamfight Tactics")){
                                        activite += " ( Teamfight Tactics ) "
                                    }

                                    activite += emojiActivite.LOL
                                    break
                                case "Valorant":
                                    activite += emojiActivite.VALORANT
                                    break
                                case "Dofus":
                                    activite += emojiActivite.DOFUS
                                    break
                                case "Fortnite":
                                    activite += emojiActivite.FORTNITE
                                    break
                                case "Spotify":
                                    try{
                                        activite += "( \"" + activity.details + "\" de \"" + activity.state + "\" ) "
                                    }
                                    catch(e) {}
                                    activite += emojiActivite.SPOTIFY
                                    break
                                case "Visual Studio Code":
                                    activite += emojiActivite.VSCODE
                                    break
                            }
                            activite += "\n"
                        })
                    }
                }
                rejoint = new Date(target.createdAt-(target.createdAt%1000)/1000)
                var rolesList = [];
                
                for(i in member._roles){
                    roleSeul = await member.guild.roles.fetch(member._roles[i])
                    rolesList.push(roleSeul)
                }

                rolesList.sort(function(a,b){
                    if (a.rawPosition>b.rawPosition) return -1;
                    if (b.rawPosition>a.rawPosition) return 1;
                    return 0;
                })

                var roles = "";
                rolesList.forEach((item) => {roles+= item.toString() + "\n"})
                var embed =  new EmbedBuilder()

                .setAuthor({ name: "Profil de " + target.username, iconURL: target.displayAvatarURL()})
                .setThumbnail(member.displayAvatarURL())
                .addFields(
                    { name: "Mention", value: target.toString(), inline: true },
                    { name: "Inscription", value: "<t:" + (rejoint.getTime()-(rejoint.getTime()%1000))/1000 + ":d>", inline: true },
                    { name: "Arrivée", value: "<t:" + (member.joinedAt-(member.joinedAt%1000))/1000 + ":d>", inline: true },
                    { name: "Nom d'invocateur", value: pseudoLol, inline: true  },
                    { name: "Points NGR", value: points.toString(), inline: true },
                    { name: "Activité(s)", value: activite, inline: false}
                )
                .setColor(member.displayHexColor)
                .setFooter({ text: "Demandé par " + interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
                if(rolesList.length){
                    embed.addFields(
                        { name: "Roles (" + rolesList.length + ")", value: roles }
                    )
                }
            }else{
                rejoint = new Date(target.createdAt-(target.createdAt%1000)/1000)
                var embed =  new EmbedBuilder()
                .setTitle("Profil de " + target.username)
                .setImage(target.displayAvatarURL())
                .addFields(
                    { name: "Mention", value: target.toString(), inline: true },
                    { name: "Inscription", value: "<t:" + (rejoint.getTime()-(rejoint.getTime()%1000))/1000 + ":d>", inline: true },
                )
                .setColor(await interaction.guild.members.fetch(interaction.client.application.id).then((morde) => { return morde.displayHexColor}));
            }
            console.log(embed)
            interaction.reply({embeds: [embed]});
        
	},
};
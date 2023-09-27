const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { tftkey, lolkey } = require("../config/configCode.json");
const fs = require('node:fs');
const Vibrant = require("node-vibrant")
const emojiRank = {
    UNRANKED : "<:unranked:1131830384301187132>",
    IRON : "<:iron:1131830380379521084>",
    BRONZE : "<:bronze:1131830369965056189>",
    SILVER : "<:silver:1131830353431121991>",
    GOLD : "<:gold:1131830336129601536>",
    PLATINUM : "<:platinum:1131830315153895424>",
    EMERALD : "<:emerald:1131830295029628948>",
    DIAMOND : "<:diamond:1131830275228315670>",
    MASTER : "<:master:1131830250398040094>",
    GRANDMASTER : "<:grandmaster:1131830222438797342>",
    CHALLENGER : "<:challenger:1131830194123046952>"
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("profil")
		.setDescription("undefined")
        .addSubcommand(subcommand =>
            subcommand
                .setName("league")
                .setDescription("Donne le profil LoL de l\'utilisateur")
    			.addStringOption(option =>
					option.setName("name")
						.setDescription("Le nom d\'invocateur de l\'user, laissez vide si configuré")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("config")
                .setDescription("Configure ton compte LoL pour qu'il soit pré-rempli")
                .addStringOption(option =>
                    option.setName("name")
                        .setDescription("Ton nom d'invocateur ( Ex : NGR Faker ) "))),
	async execute(interaction) {
        await interaction.deferReply();
        const result = await commande();
        await interaction.editReply(result);
        //interaction.reply(await commande())
        async function commande() {
            nomInvovateur = interaction.options.getString("name");
            const fichier = "config/configProfil.json"
            configJSON = JSON.parse(fs.readFileSync(fichier,"utf-8"));

            if(interaction.options.getSubcommand() === 'league'){
                
                let idConfig;
                if(nomInvovateur){
                    if(nomInvovateur.startsWith("<@") && nomInvovateur.endsWith(">") && nomInvovateur.length > 3) {
                        idConfig = configJSON[nomInvovateur.slice(2,nomInvovateur.length-1)];
                        nomInvovateur = undefined;
                    }
                }else {
                    idConfig = configJSON[interaction.user.id];
                }

                if(!nomInvovateur) {
                    if(!idConfig) {
                        return interaction.reply("Veuillez remplir un pseudo ou le configurez avec le /profil config");
                    }
                    else{
                        profile = await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" + idConfig + "?api_key=" + lolkey);
                    }
                }
                else{
                    profile =  await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + nomInvovateur + "?api_key=" + lolkey).catch(function (error){});
                    if(profile == undefined){return `${nomInvovateur} n'est pas un pseudo valide.`};
                }

                const championPref = await axios.get("https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + profile.data.id + "?api_key=" + lolkey);
                if(championPref.data[0] == undefined){return `${nomInvovateur} ne semble pas déja avoir joué à LoL pas. Vérifiez l'orthographe`};

                const rank = await axios.get("https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + profile.data.id + "?api_key=" + lolkey)
                const image = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/" + championPref.data[0].championId + "/" + championPref.data[0].championId + "000.jpg";

                function componentToHex(c) {let hex = c.toString(16);return hex.length == 1 ? "0" + hex : hex;}

                function rgbToHex(r, g, b) {return Number("0x" + componentToHex(r) + componentToHex(g) + componentToHex(b));}
                
                await Vibrant.from(image).getPalette((err, palette) => rgb = palette.Vibrant._rgb)

                console.log(profile.data);

                var embed =  new EmbedBuilder()
                    .setAuthor({name:profile.data.name, iconURL:("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/" + profile.data.profileIconId + ".jpg"), url:"https://www.op.gg/summoners/euw/" + encodeURI(profile.data.name)})
                    .setThumbnail("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-tiles/" + championPref.data[0].championId + "/" + championPref.data[0].championId + "000.jpg")
                    .addFields({ name: "Niveau d\'invocateur", value: profile.data.summonerLevel.toString() })
                    .setColor(rgbToHex(rgb[0],rgb[1],rgb[2]));
                
                if(rank.data.length >= 1){
                    const dicoRank =  {
                        "RANKED_SOLO_5x5":1,
                        "RANKED_FLEX_SR":2,
                        "CHERRY":3,
                        "RANKED_TFT_DOUBLE_UP":4
                    }
                    rank.data.sort(function(a,b){
                        if (dicoRank[a.queueType] < dicoRank[b.queueType]) return -1;
                        if (dicoRank[a.queueType] > dicoRank[b.queueType]) return 1;
                        return 0;
                    })
                    for (let i = 0; i < rank.data.length; i++) {
                        winrate = Math.round(rank.data[i].wins / (rank.data[i].wins + rank.data[i].losses)*10000)/100
                        field = { name : "", value: rank.data[i].tier + " " + rank.data[i].rank + " " + rank.data[i].leaguePoints + " LP " + emojiRank[rank.data[i].tier] + " ( " + winrate + "% de winrate )"}
                        check = true
                        switch (rank.data[i].queueType) {
                            case "RANKED_SOLO_5x5":
                                field.name = "Solo/Duo Queue"
                                break
                            case "RANKED_FLEX_SR":
                                field.name = "Classé Flexible"
                                break
                            case "RANKED_TFT_DOUBLE_UP":
                                field.name = "TFT Double Up"
                                break
                            case "CHERRY":
                                field = {name: "Arena", value: winrate + "% de winrate, " + (rank.data[i].wins + rank.data[i].losses) + " parties"}
                                break
                            default:
                                check = false
                        }
                        if(check) {
                            embed.addFields(field)
                        }
                    }
                }else{
                    embed.addFields({name: "Solo/Duo Queue", value: "Non-classé" + emojiRank["UNRANKED"]})
                }
                return {embeds: [embed]}
            }
            if(interaction.options.getSubcommand() === 'config'){

                if(!nomInvovateur) {
                    return "Veuillez remplir un pseudo ( Ex : NGR Faker )"
                }
                else{
                    profile =  await axios.get("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + nomInvovateur + "?api_key=" + lolkey).catch(function (error){});
                    if(profile == undefined){return `${nomInvovateur} n'est pas un pseudo valide.`};
                }
                configJSON[interaction.user.id] = profile.data.puuid;
                fs.writeFileSync(fichier, JSON.stringify(configJSON,null,2));
                
                return {
                    content:`Pseudo validé (${nomInvovateur})`,
                    ephemeral:true
                }
            }
        }
	},
};
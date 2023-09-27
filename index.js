const { Client, GatewayIntentBits, Events } = require("discord.js");
const { token } = require("./config/configCode.json");
const path = require("node:path");
const fs = require("fs");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],

});
client.commands = new Map();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
		} else {
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	}
});

client.on("ready", () => { // send a message when bot ready and set presence
    console.log(`${client.user.tag} est prêt!`);
    
    const Guild = client.guilds.cache.get("1017742904753655828");
    var botNumber = 0;
    const Members = Guild.members.cache.map(member =>{
        if(member.user.bot == false){return member.user.username}botNumber+=1});
    
    for(let i = 0; i<botNumber;i++){
        Members.splice(Members.indexOf(undefined),1)};

    setInterval(() =>{
        const status = Members[Math.floor(Math.random() * Members.length)];
        client.user.setPresence({activities: [{ name: `${status}`, type: 3}]});
    }, 10000);

    client.users.fetch('524926551431708674').then(livreur => livreur.send("Prêt !"));
})

client.on("messageCreate", message => { // reply feur to quoi
    if(message.author.id === '1061982486835515412'){return;}
    
    const fichier = "./config/configReglages.json"
    configJSON = JSON.parse(fs.readFileSync(fichier,"utf-8"));
    
    if(message.member.roles.cache.has("1104446622043209738")){
        if(message.content.startsWith("!")){
            command = message.content.slice(message.content.indexOf("!") + 1);
            switch(command) {
                case "ping":
                    message.channel.send("pong");
                break;
                case "quoifeur":
                    etat = configJSON["quoifeur"]
                    configJSON["quoifeur"] = !configJSON["quoifeur"];
                    fs.writeFileSync(fichier, JSON.stringify(configJSON,null,2));
                    if(etat){
                        message.channel.send("feur desactivé");
                    }
                    else{
                        message.channel.send("feur activé");
                    }
                    break;
            }
        }
    }

    if(configJSON["quoifeur"]){
        if (message.content.toLowerCase().includes("quoi ") || message.content.toLowerCase().endsWith("quoi")) {
            message.reply("feur");
            return;
        }
        if (message.content.toLowerCase().includes("pourquoi")) {
            message.reply("pour feur");
            return;
        }

        if(message.content.toLowerCase().endsWith("ou")){
            message.reply("zbekistan");
            return;
        }

        switch(message.content.toLowerCase()){
            case "oui":
                message.reply("ski");
                return;
            case "feur":
                message.reply("ouge");
                return;
            case "ouge":
                message.reply("gorge");
                return;
            case "rouge":
                message.reply("gorge");
                return;
            case "gorge":
                message.reply("profonde");
                return;
            case "profonde":
                message.reply("eur");
                return;
        }
    }
    
    if(message.author.tag == client.user.tag){
        try{
    		if(message.embeds[0].data.thumbnail.url == "https://i.imgur.com/mPbkGEu.jpg"){
                message.react("✅");
                message.react("❌");
            }else if(message.embeds[0].data.thumbnail.url == "https://i.postimg.cc/tCTmtJqh/image.png"){
				message.react("1️⃣");
                message.react("2️⃣");
                message.react("3️⃣");
            } 
        }
        catch(error){
        }
    }


});

client.on("messageCreate", message => {
    if (message.channelId === "1046833762375323769" && !message.system) {
        message.delete();
        return
    }
    if (message.channelId === "1072205408938246173"){
        if(message.content != "mdr" || message.attachments.size > 0 || message.stickers.size > 0 || message.mentions.repliedUser != null ){
            message.delete();
            if(message.author.tag != client.user.tag){
                message.author.send("ecris mdr sale pd");
                if(!message.member.roles.cache.has("1045753047067926628")){
                    message.member.timeout(60000,"il a pas dit mdr")
                }
            }
        }
    }
})

client.on("guildMemberUpdate", function(oldMember, newMember){

    if(oldMember.nickname != null){var conditionAncienNom = oldMember.nickname.startsWith('NGR | ')}
    else{var conditionAncienNom = false}

    if(newMember.nickname != null){var conditionNouveauNom = newMember.nickname.startsWith('NGR | ')}
    else{var conditionNouveauNom = false}
	if(!(oldMember._roles.includes('1104446622043209738')) && newMember._roles.includes('1104446622043209738') && !conditionAncienNom){
		if(!newMember._roles.includes('1045753047067926628')){
            if(newMember.nickname != null){
                if(newMember.nickname.length <= 26){
                    newMember.setNickname('NGR | ' + newMember.nickname)
                }else{
                    newMember.setNickname('NGR | ' + newMember.nickname.slice(0,26))
                }
            }
            else if(newMember.user.username.length <= 26){
                newMember.setNickname('NGR | ' + newMember.user.username)
            }else{
                newMember.setNickname('NGR | '+ newMember.user.username.slice(0,26))
            }
        }
    }else if(oldMember._roles.includes('1104446622043209738') && !(newMember._roles.includes('1104446622043209738'))){
		if(!(newMember._roles.includes('1045753047067926628')) && conditionNouveauNom){
        	newMember.setNickname(newMember.nickname.slice(6))
            if(newMember.nickname.slice(6) === newMember.user.username || newMember.user.username.startsWith(newMember.nickname.slice(6))){
                newMember.setNickname("");
            }
        }
    }
    
    if(!conditionAncienNom && conditionNouveauNom){
        newMember.roles.add('1104446622043209738')
    }else if(conditionAncienNom && !conditionNouveauNom){
		newMember.roles.remove('1104446622043209738')
    }
});

client.on('voiceStateUpdate', async (oldMember, newMember) => {
    if(newMember.member.user.id == '524926551431708674'){
        try {
            if(newMember.channelId == null){
                setTimeout(() => {newMember.member.timeout(null) }, 5000)
            }
        } catch (error) {
            console.log("Pas les permissions")
        }
    }else return
});

client.on(Events.InteractionCreate, async interaction => {
    switch (interaction.customId){
        case 'boutonngr':
            interaction.member.roles.add('1104446622043209738');
            interaction.reply({content : 'Bienvenue dans la team NGR',ephemeral:true});
        break;
        case 'boutonjuif':
            interaction.member.roles.add('1061954160557305867');
            interaction.reply({content : 'T\'es juif maintenant',ephemeral:true})
        break;
    }
})

client.login(token);
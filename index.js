const { Client, GatewayIntentBits, Events, Partials, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { token } = require("./config/configCode.json");
const path = require("node:path");
const cron = require("cron");
const axios = require("axios")
const fs = require("fs");
const client = new Client({
    partials: [
        Partials.Channel,
    ],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
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

client.on("ready", () => {
    console.log(`${client.user.tag} est prêt!`);

    const Guild = client.guilds.cache.get("1017742904753655828");
    let botNumber = 0;
    const Members = Guild.members.cache.map(member => {
        if (member.user.bot == false) { return member.user.username } botNumber += 1
    });

    for (let i = 0; i < botNumber; i++) {
        Members.splice(Members.indexOf(undefined), 1)
    };

    setInterval(() => {
        const status = Members[Math.floor(Math.random() * Members.length)];
        client.user.setPresence({ activities: [{ name: `${status}`, type: 3 }] });
    }, 10000);

    devine_champ.start()

    client.users.fetch('524926551431708674').then(livreur => livreur.send("Prêt !"));
})

client.on("messageCreate", message => {
    // Réponds quoi feur etc... aux messages si l'option est activée
    if (message.author.id === '1061982486835515412' || !message.guildId) { return }

    const fichier = "./config/configReglages.json"
    let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

    if (message.member.roles.cache.has("1104446622043209738")) {
        if (message.content.startsWith("!")) {
            let command = message.content.slice(message.content.indexOf("!") + 1);
            switch (command) {
                case "ping":
                    message.channel.send("pong");
                    break;
                case "quoifeur":
                    let etat = configJSON["quoifeur"]
                    configJSON["quoifeur"] = !configJSON["quoifeur"];
                    fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2));
                    if (etat) {
                        message.channel.send("feur desactivé");
                    }
                    else {
                        message.channel.send("feur activé");
                    }
                    break;
            }
        }
    }

    if (configJSON["quoifeur"]) {
        if (message.content.toLowerCase().includes("quoi ") || message.content.toLowerCase().endsWith("quoi")) {
            message.reply("feur");
            return;
        }
        if (message.content.toLowerCase().includes("pourquoi")) {
            message.reply("pour feur");
            return;
        }

        if (message.content.toLowerCase().endsWith("ou")) {
            message.reply("zbekistan");
            return;
        }

        switch (message.content.toLowerCase()) {
            case "oui":
                message.reply("ski")
                break
            case "feur":
                message.reply("ouge")
                break
            case "ouge":

            case "rouge":
                message.reply("gorge")
                break
            case "gorge":
                message.reply("profonde")
                break
            case "profonde":
                message.reply("eur")
                break
        }
    }

    // Régule le salon mdr pour filtrer les messages
    if (message.channelId === "1046833762375323769" && !message.system) {
        message.delete();
        return
    }
    if (message.channelId === "1072205408938246173") {
        if (message.content != "mdr" || message.attachments.size > 0 || message.stickers.size > 0 || message.mentions.repliedUser != null) {
            message.delete();
            if (message.author.tag != client.user.tag) {
                message.author.send("Le salon est drôle, il faut marquer mdr...");
                if (!message.member.roles.cache.has("1045753047067926628")) {
                    message.member.timeout(60000, "il a pas dit mdr")
                }
            }
        }
    }
});

client.on("messageCreate", message => {
    // Complète la commande /vote
    if (!message.guildId || message.embeds.length === 0 || !message.interaction) { return }
    if (message.interaction.commandName == "vote") {
        if (message.author.tag === client.user.tag) {
            if (message.embeds[0].data.thumbnail.url == "https://raw.githubusercontent.com/coulontitouan/botdiscord/main/static/vote2opt.jpg") {
                message.react("✅");
                message.react("❌");
            } else if (message.embeds[0].data.thumbnail.url == "https://raw.githubusercontent.com/coulontitouan/botdiscord/main/static/vote3opt.jpg") {
                message.react("1️⃣");
                message.react("2️⃣");
                message.react("3️⃣");
            }
        }
    }
})

client.on("messageCreate", message => {
    if (message.guildId) { return }
    if (message.content.includes("!debanmoi")) {
        const Guild = client.guilds.cache.get("1017742904753655828");
        Guild.members.cache.map(async member => {
            if (member.user.id == message.author.id) {
                try {
                    await member.timeout(null)
                    message.reply(`${message.author.tag} a été deban.`)
                } catch (error) {
                    console.log(`Erreur lors du deban de ${message.author.tag}.`)
                }
            }
        }
        )
    }
})

client.on("guildMemberUpdate", function (oldMember, newMember) {

    if(newMember.id == "429307989011202048"){
        if(newMember.nickname == "faux titouan (la ptite soumise)"){
            return
        }
        newMember.setNickname("faux titouan (la ptite soumise)")
        return
    }

    if(newMember.id == "766693700050878504"){
        if(newMember.nickname == "cyprine le voleur de vannes"){
            return
        }
        newMember.setNickname("cyprine le voleur de vannes")
        return
    }

    let conditionAncienNom, conditionNouveauNom

    if (oldMember.nickname != null) {
        conditionAncienNom = oldMember.nickname.startsWith('NGR | ')
    } else {
        conditionAncienNom = false
    }

    if (newMember.nickname != null) {
        conditionNouveauNom = newMember.nickname.startsWith('NGR | ')
    } else {
        conditionNouveauNom = false
    }

    if (!(oldMember._roles.includes('1104446622043209738')) && newMember._roles.includes('1104446622043209738') && !conditionAncienNom) {
        if (!newMember._roles.includes('1045753047067926628')) {
            if (newMember.nickname != null) {
                if (newMember.nickname.length <= 26) {
                    newMember.setNickname('NGR | ' + newMember.nickname)
                } else {
                    newMember.setNickname('NGR | ' + newMember.nickname.slice(0, 26))
                }
            }
            else if (newMember.user.username.length <= 26) {
                newMember.setNickname('NGR | ' + newMember.user.username)
            } else {
                newMember.setNickname('NGR | ' + newMember.user.username.slice(0, 26))
            }
        }
    } else if (oldMember._roles.includes('1104446622043209738') && !(newMember._roles.includes('1104446622043209738'))) {
        if (!(newMember._roles.includes('1045753047067926628')) && conditionNouveauNom) {

            newMember.setNickname(newMember.nickname.slice(6))

            if (newMember.nickname.slice(6) === newMember.user.username || newMember.user.username.startsWith(newMember.nickname.slice(6))) {
                newMember.setNickname("");
            }
        }
    }

    if (!conditionAncienNom && conditionNouveauNom) {
        newMember.roles.add('1104446622043209738')
    } else if (conditionAncienNom && !conditionNouveauNom) {
        newMember.roles.remove('1104446622043209738')
    }
});

client.on(Events.InteractionCreate, async interaction => {
    // Complète la commande boutonrole
    switch (interaction.customId) {
        case 'boutonngr':
            interaction.member.roles.add('1104446622043209738');
            interaction.reply({ content: 'Bienvenue dans la team NGR', ephemeral: true });
            break;
        case 'boutonjuif':
            interaction.member.roles.add('1061954160557305867');
            interaction.reply({ content: 'T\'es juif maintenant', ephemeral: true })
            break;
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isAutocomplete()) {
        if (interaction.commandName == "repondre"){
            const focusedOption = interaction.options.getFocused(true);
            let choices;

            let request = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
            let version = request["data"][0]
            request = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`)
            let champions = Object.values(request["data"]["data"])

            const filtered = champions.filter(choice => choice.startsWith(focusedOption.value));
    
            let options;
            if (filtered.length > 25) {
                options = filtered.slice(0, 25);
            } else {
                options = filtered;
            }
    
            await interaction.respond(
                options.map(choice => ({ name: choice, value: choice })),
            );
        }
    }
});

let devine_champ = new cron.CronJob('*/10 * 22 * * *', async () => {
    const Guild = client.guilds.cache.get("1017742904753655828");
    const channel = Guild.channels.cache.get('1182053797049143337');

    let request = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
    let version = request["data"][0]
    
    request = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`)
    let champions = request["data"]["data"]
    let randomChamp = champions[Object.keys(champions)[Math.floor(Math.random()*Object.keys(champions).length)]]["name"]
    
    const select = new StringSelectMenuBuilder()
    .setCustomId('starter')
    .setPlaceholder('Make a selection!');

    for(let champion of Object.values(champions)){
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(champion["name"])
                .setDescription(champion["title"])
                .setValue(champion["id"]),
        )
    }

    const row = new ActionRowBuilder()
        .addComponents(select);
    
    console.log(randomChamp)
    channel.send({
        content: 'Qui est ce champion ?',
        components: [row],
    });
},undefined,true,"Europe/Paris");

client.login(token);
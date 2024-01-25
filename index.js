const { Client, GatewayIntentBits, Events, Partials, roleMention, userMention, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, strikethrough } = require("discord.js");
const { token } = require("./config/configCode.json");
const path = require("node:path");
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
            case "ni":
                message.reply("gger")
                break
            case "nig":
                message.reply("ger")
                break
        }
    }

    // Régule le salon mdr pour filtrer les messages
    if (message.channelId === "1046833762375323769" && !message.system) {
        message.delete();
        return
    }
    if (message.channelId === "1072205408938246173") {
        if ((message.content != "mdr" && message.content != "笑") || message.attachments.size > 0 || message.stickers.size > 0 || message.mentions.repliedUser != null) {
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

    if (newMember.id == "429307989011202048") {
        if (newMember.nickname == "faux titouan (la ptite soumise)") {
            return
        }
        newMember.setNickname("faux titouan (la ptite soumise)")
        return
    }

    if (newMember.id == "766693700050878504") {
        if (newMember.nickname == "cyprine le voleur de vannes") {
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
    const buttonSignIn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('inscription')
            .setEmoji('<:lol:1128386682513784853>')
            .setLabel('S\'inscrire')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('desinscription')
            .setEmoji('<:lol:1128386682513784853>')
            .setLabel('Se désinscrire')
            .setStyle(ButtonStyle.Danger)
    );
    switch (interaction.customId) {
        case 'boutonngr':
            interaction.member.roles.add('1104446622043209738');
            interaction.reply({ content: 'Bienvenue dans la team NGR', ephemeral: true });
            break;
        case 'boutonjuif':
            interaction.member.roles.add('1061954160557305867');
            interaction.reply({ content: 'T\'es juif maintenant', ephemeral: true })
            break;
        case 'confirm':
            let embed = interaction.message.embeds[0];
            const tempEmbed = new EmbedBuilder(embed).setFooter(null);
            embed.footer = { text: "Partie confirmée" };
            interaction.message.delete();
            interaction.channel.send({ content: interaction.message.embeds[0].footer.text.includes("true") ? `${roleMention("1123736136246894662")}` : "", embeds: [tempEmbed], components: [buttonSignIn] })
            interaction.reply({ content: "Confirmée !", ephemeral: true })
            break;
        case 'cancel':
            interaction.message.delete();
            interaction.reply({ content: "Annulée !", ephemeral: true })
            break
        case 'modifier':
            break
        case 'inscription':
        case 'desinscription':

            let len = interaction.message.embeds[0].fields.length - 1;
            let mention = userMention(`${interaction.member.user.id}`);
            let raye = strikethrough(`${mention}`);
            let participantField = interaction.message.embeds[0].fields[len].value;
            let oldEmbed = interaction.message.embeds[0];

            let condition1 = interaction.customId == 'inscription';
            let condition2 = participantField.includes(mention) && !(participantField.includes(raye));

            console.log(condition1 ? mention : raye)
            console.log(condition1 ? "inscription" : "desinscription")
            console.log("Deja inscrit", condition2)
            console.log(!(condition1 ^ condition2))
            if (!(condition1 ^ condition2)) {
                interaction.reply({ content: `Tu ${condition1 ? 'es déja' : 'n\'es pas'} inscrit`, ephemeral: true })
                return;
            }
            let newValue = condition1 ? // Si on s'inscrit
                participantField.includes(raye) ? // Si on est déja inscrit
                    oldEmbed.fields[len].value.replace(raye, mention) : // On deraye
                    oldEmbed.fields[len].value + `\n${mention}` : // sinon on ajoute
                oldEmbed.fields[len].value.replace(mention, raye); // si on se desinscrit on raye

            const tempEmbed2 = new EmbedBuilder(oldEmbed)
                .setFields([
                    ...oldEmbed.fields.slice(0, len),
                    { name: " - Inscrits :", value: newValue }
                ]);
            interaction.message.edit({ embeds: [tempEmbed2], components: [buttonSignIn] })
            interaction.reply({ content: `${condition1 ? "I" : "Dési"}nscrit !`, ephemeral: true })
            break;
        // case 'desinscription':
        //     len = interaction.message.embeds[0].fields.length - 1;
        //     if (!interaction.message.embeds[0].fields[len].value.includes(userMention(`${interaction.member.user.id}`))) {
        //         interaction.reply({ content: "Tu n'es pas inscrit", ephemeral: true })
        //         return;
        //     }
        //     let desinscrit = interaction.message.embeds[0];
        //     newValue = desinscrit.fields[len].value.replace(
        //         userMention(`${interaction.member.user.id}`), strikethrough(`${interaction.member.user.id}`)
        //     )
        //     const tempEmbed3 = new EmbedBuilder(desinscrit)
        //         .setFields([
        //             ...desinscrit.fields.slice(0, len),
        //             { name: " - Inscrits :", value: newValue }
        //         ]);
        //     interaction.message.edit({ embeds: [tempEmbed3], components: [buttonSignIn] })
        //     interaction.reply({ content: "Désinscrit !", ephemeral: true })
        //     break;

    }
})

client.login(token);
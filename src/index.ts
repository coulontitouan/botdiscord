import { Client, GatewayIntentBits, Events, Partials, roleMention, userMention, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, strikethrough, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, time, GuildMember, ChatInputCommandInteraction, ButtonInteraction, ChannelType, MessageReference, Embed, Channel, TextBasedChannel, AnySelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, MessageComponent, MessageComponentInteraction } from "discord.js";
import path from "node:path";
import fs from "fs";
import dotenv from 'dotenv';
import { remindModel } from "./schemas/remindSchema.js";
import { fileURLToPath, pathToFileURL } from 'url';
import { LolDleGame } from "./loldleGame.js";

dotenv.config();

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
        GatewayIntentBits.GuildVoiceStates,
    ]
});

export default client

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath);

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: event } = await import(fileUrl);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath)

const commands = new Map();
const autocompleteMap = new Map();

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: command } = await import(fileUrl);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
        if ("autocomplete" in command) {
            autocompleteMap.set(command.data.name, command.autocomplete);
        }
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const buttonsPath = path.join(__dirname, 'buttons');
const buttonsFiles = fs.readdirSync(buttonsPath);
const buttonsMap = new Map();

for (const file of buttonsFiles) {
    const filePath = path.join(buttonsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const { default: button } = await import(fileUrl);
    if ("name" in button && "execute" in button) {
        buttonsMap.set(button.name, button);
    } else {
        console.log(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);

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

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isAutocomplete()) return;
    const autocomplete = autocompleteMap.get(interaction.commandName);

    if (!autocomplete) {
        console.error(`No autocomplete matching ${interaction.commandName} was found.`);
        return;
    }

    await autocomplete(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isMessageComponent()) return;
    const button = buttonsMap.get(interaction.customId);
    try {
        await button.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this button!", ephemeral: true });
        } else {
            await interaction.reply({ content: "There was an error while executing this button!", ephemeral: true });
        }
    }
})

setInterval(async () => {
    const data = await remindModel.find();
    // if (data.length == 0) { console.log("bd vide") }
    for (let i of data) {
        if (i.Time.valueOf() <= Date.now()) {
            client.users.fetch(i.User).then((user) => {
                let embed = new EmbedBuilder()
                    .setTitle("Rappel")
                    //.setDescription(`Votre rappel pour la partie en ${i.type}, le ${i.date} à ${i.heure} dans le salon ${i.salon}`)
                    //.setTimestamp()
                    .setURL(i.url)
                user.send({ embeds: [embed], content: `Votre rappel pour le match ${i.url}` });
            });
            await remindModel.findByIdAndDelete(i._id);
        }
    }
}, 60000)

await LolDleGame.newChampion();
setInterval(() => LolDleGame.newChampion(), 24 * 60 * 60 * 1000)

client.login(process.env.TOKEN);
import { Client, GatewayIntentBits, Events, Partials, EmbedBuilder } from "discord.js";
import path from "node:path";
import fs from "fs";
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';

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

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath, { recursive: true, withFileTypes: true }).filter(file => file.isFile() && file.name.endsWith('.js'));

const commands = new Map();
const autocompleteMap = new Map();

for (const file of commandFiles) {
    const filePath = path.join(file.parentPath, file.name);
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

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
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

client.login(process.env.TOKEN);
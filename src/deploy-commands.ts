import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { CLIENT_ID, GUILD_ID, REST_CLIENT } from './constants.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandOptionsOnlyBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath, { recursive: true, withFileTypes: true }).filter(file => file.isFile() && file.name.endsWith('.js'));

for (const file of commandFiles) {
    let fileName = path.join(file.parentPath.split("commands")[1] ?? "", file.name);
    const { default: command } = await import(`./commands/${fileName}`);
    commands.push(command.data.toJSON());
}

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await REST_CLIENT.put(
            Routes.applicationCommands(CLIENT_ID),
            // Routes.applicationGuildCommands(CLIENT_ID , GUILD_ID ),
            { body: commands },
        ) as any[];

        Routes.applicationCommands(CLIENT_ID);

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
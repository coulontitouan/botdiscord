import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath, { recursive: true, withFileTypes: true }).filter(file => file.isFile() && file.name.endsWith('.js'));

for (const file of commandFiles) {
	let fileName = path.join(file.parentPath.split("commands")[1] ?? "", file.name);
	const { default: command } = await import(`./commands/${fileName}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID as string),
			// Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
			{ body: commands },
		) as any[];

		Routes.applicationCommands(process.env.CLIENT_ID as string);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

// const allcommands: any[] = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string)) as any[];
// for (const command of allcommands) {
// 	rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID as string, process.env.GUILD_ID as string, command.id))
// 		.then(() => console.log('Successfully deleted application command'))
// 		.catch(console.error)
//  }
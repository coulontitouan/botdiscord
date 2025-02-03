import { REST, Routes } from "discord.js";
import { TOKEN, CLIENT_ID } from '../../constants.js';

export default async function getCommandId(data: { name: string }) {
    return (await new REST({ version: '10' }).setToken(TOKEN as string).get(Routes.applicationCommands(CLIENT_ID as string)) as any[]).find(cmd => cmd.name === data.name).id
}
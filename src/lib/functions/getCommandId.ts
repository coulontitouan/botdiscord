import { REST, Routes } from "discord.js";

export default async function getCommandId(data: { name: string }) {
    return (await new REST({ version: '10' }).setToken(process.env.TOKEN as string).get(Routes.applicationCommands(process.env.CLIENT_ID as string)) as any[]).find(cmd => cmd.name === data.name).id
}
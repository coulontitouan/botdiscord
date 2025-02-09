import { Routes } from "discord.js";
import { CLIENT_ID, GUILD_ID, REST_CLIENT } from "./constants.js";

const guildCommands = await REST_CLIENT.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)) as any[];
for (const command of guildCommands) {
    REST_CLIENT.delete(Routes.applicationGuildCommand(CLIENT_ID, GUILD_ID, command.id))
        .then(() => console.log('Successfully deleted application command'))
        .catch(console.error)
}
const applicationCommands = await REST_CLIENT.get(Routes.applicationCommands(CLIENT_ID)) as any[];
for (const command of applicationCommands) {
    REST_CLIENT.delete(Routes.applicationCommand(CLIENT_ID, command.id))
        .then(() => console.log('Successfully deleted application command'))
        .catch(console.error)
}
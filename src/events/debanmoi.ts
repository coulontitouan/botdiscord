import { Events, Guild, Message } from 'discord.js';
import fs from "fs";

export default {
    name: Events.MessageCreate,
    execute(message: Message) {
        if (message.guildId) { return }
        if (message.content.includes("!debanmoi") && !message.author.bot) {
            const fichier = "./config/configReglages.json"
            let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

            if (!configJSON["debanmoi"]) {
                return message.reply("Le !debanmoi est désactivé.")
            }

            const Guild = message.client.guilds.cache.get("1017742904753655828") as Guild;
            Guild.members.cache.map(async member => {
                if (member.user.id == message.author.id) {
                    try {
                        member.timeout(null).then(() => {
                            message.reply(`${message.author.tag} a été deban.`)
                        }).catch(() => {
                            message.reply(`Erreur lors du deban de ${message.author.tag}.`)
                        })
                    } catch (error) {
                        console.log(`Erreur lors du deban de ${message.author.tag}.`)
                    }
                }
            }
            )
        }
    },
};
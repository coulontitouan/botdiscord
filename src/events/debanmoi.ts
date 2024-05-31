const { Events } = require('discord.js');
const client = require("../index.js");
const fs = require("fs");

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.guildId) { return }
        if (message.content.includes("!debanmoi") && !message.author.bot) {
            const fichier = "./config/configReglages.json"
            let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));
            console.log(configJSON["debanmoi"])
            if (!configJSON["debanmoi"]) {
                return message.reply("Le !debanmoi est désactivé.")
            }
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
    },
};
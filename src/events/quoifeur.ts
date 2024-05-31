const { Events } = require('discord.js');
const fs = require('fs')

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.id === '1061982486835515412' || !message.guildId) { return }

        const fichier = "./config/configReglages.json"
        let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

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
    }
}
const { Events } = require('discord.js');
const client = require("../index.js")

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guildId || message.embeds.length === 0 || !message.interaction) { return }
        if (message.interaction.commandName == "vote") {
            if (message.author.tag === client.user.tag) {
                if (message.embeds[0].data.thumbnail.url == "https://raw.githubusercontent.com/coulontitouan/botdiscord/main/static/vote2opt.jpg") {
                    message.react("✅");
                    message.react("❌");
                } else if (message.embeds[0].data.thumbnail.url == "https://raw.githubusercontent.com/coulontitouan/botdiscord/main/static/vote3opt.jpg") {
                    message.react("1️⃣");
                    message.react("2️⃣");
                    message.react("3️⃣");
                }
            }
        }
    },
};
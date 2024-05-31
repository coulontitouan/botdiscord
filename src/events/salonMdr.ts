const { Events } = require('discord.js');
const client = require("../index.js")

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channelId === "1072205408938246173") {
            if ((message.content != "mdr" && message.content != "笑") || message.attachments.size > 0 || message.stickers.size > 0 || message.mentions.repliedUser != null) {
                message.delete();
                if (message.author.tag != client.user.tag) {
                    message.author.send("Le salon est drôle, il faut marquer mdr...");
                    if (!message.member.roles.cache.has("1045753047067926628")) {
                        message.member.timeout(60000, "il a pas dit mdr")
                    }
                }
            }
        }
    }
};
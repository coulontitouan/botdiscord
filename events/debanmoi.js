const { Events } = require('discord.js');
const client = require("../index.js")

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.guildId) { return }
        if (message.content.includes("!debanmoi")) {
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
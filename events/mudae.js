const { Events } = require('discord.js');
const client = require('../index.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.id == '432610292342587392' && message.mentions.has(client.user.id) && message.content.includes('Confirmez-vous ? (o/n)')) {
            message.reply("o");
            message.channel.send("https://tenor.com/view/banana-gif-18315426");
        }
    }
}
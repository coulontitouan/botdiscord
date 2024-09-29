import { Events, Message } from 'discord.js';

export default {
    name: Events.MessageCreate,
    async execute(message:Message) {
        if (message.author.id === '432610292342587392' && message.mentions.has(message.client.user.id) && message.content.includes('Confirmez-vous ? (o/n)')) {
            message.reply("o");
            message.channel.send("https://tenor.com/view/banana-gif-18315426");
        }
    }
}
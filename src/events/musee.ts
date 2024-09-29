import { Events, Message } from 'discord.js';

export default {
    name: Events.MessageCreate,
    async execute(message: Message) {
        if (message.channelId === "1046833762375323769" && !message.system) {
            return message.delete();
        }
    }
};

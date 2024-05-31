const { Events } = require('discord.js');
const client = require("../index.js")

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channelId === "1046833762375323769" && !message.system) {
            message.delete();
            return
        }
    }
};

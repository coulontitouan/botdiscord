const { Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldMember, newMember) {
        if (newMember.channelId === '1052305939388170311') {
            (await newMember.guild.members.fetch(newMember.id)).roles.add('1061954160557305867');
        }
        if (oldMember.channelId === '1052305939388170311') {
            (await oldMember.guild.members.fetch(newMember.id)).roles.remove('1061954160557305867');
        }
    },
};
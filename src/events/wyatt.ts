import { Events, GuildMember, VoiceState } from 'discord.js';

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldMember:VoiceState, newMember:VoiceState) {
        if (newMember.channelId === '1052305939388170311') {
            (await newMember.guild.members.fetch(newMember.id)).roles.add('1061954160557305867');
        }
        if (oldMember.channelId === '1052305939388170311') {
            (await oldMember.guild.members.fetch(newMember.id)).roles.remove('1061954160557305867');
        }
    },
};
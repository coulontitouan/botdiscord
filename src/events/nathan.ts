import { Events, GuildMember } from 'discord.js';

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldMember:GuildMember, newMember:GuildMember) {
        // pas encore prête
    },
};
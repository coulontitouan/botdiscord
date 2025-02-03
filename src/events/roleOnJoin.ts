import { GuildMember, Events } from 'discord.js';
import { GUILD_ID } from '../constants.js';

export default {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        return // desactivé
        if (member.guild.id == GUILD_ID && !member.user.bot) {
            member.roles.add('1061954160557305867')
        }
    },
};
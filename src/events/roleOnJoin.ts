import { GuildMember, Events } from 'discord.js';

export default {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        return // desactivé
        if (member.guild.id == '1017742904753655828' && !member.user.bot) {
            member.roles.add('1061954160557305867')
        }
    },
};
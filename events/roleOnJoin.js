const { Events } = require('discord.js');
const client = require("../index.js")

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.guild.id == '1017742904753655828' && !member.user.bot) {
            member.roles.add('1061954160557305867')
        }
    },
};
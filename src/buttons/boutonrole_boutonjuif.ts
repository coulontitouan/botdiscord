import { GuildMember, MessageComponentInteraction } from 'discord.js';

export default {
    name: "boutonjuif",
    async execute(interaction: MessageComponentInteraction) {
        const member = interaction.member as GuildMember;
        member.roles.add('1061954160557305867');
        interaction.reply({ content: 'T\'es juif maintenant', ephemeral: true })
    },
};
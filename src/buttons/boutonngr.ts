import { GuildMember, MessageComponentInteraction } from 'discord.js';

export default {
    name: "boutonngr",
    async execute(interaction: MessageComponentInteraction) {
        const member = interaction.member as GuildMember;
        member.roles.add('1104446622043209738');
        interaction.reply({ content: 'Bienvenue dans la team NGR', ephemeral: true });
    },
};
import { EmbedBuilder, GuildMember, MessageComponentInteraction, TextBasedChannel, TextChannel, roleMention } from 'discord.js';
import verifAuteur from '../lib/functions/verifAuteur.js';
import { gameSignIn } from '../lib/buttons/gameSignIn.js';

export default {
    name: "confirm",
    async execute(interaction: MessageComponentInteraction) {
        const member = interaction.member as GuildMember;
        if (! await verifAuteur(interaction)) { return }
        const content = interaction.message.content ?? "";
        let timestamp = (content.split('<t:').pop() ?? "").split(':R>')[0];
        let embed = interaction.message.embeds[0];
        const tempEmbed = new EmbedBuilder(embed.toJSON()).setFooter({ text: `${member.user.id}-${timestamp}` });
        interaction.message.delete();
        const channel = interaction.channel as TextChannel;
        channel.send({ content: (interaction.message.embeds[0].footer ?? { text: "" }).text.includes("true") ? `${roleMention("1123736136246894662")}` : "", embeds: [tempEmbed], components: [gameSignIn] })
        interaction.reply({ content: interaction.customId == 'confirm' ? "Confirmée !" : "Annulée !", ephemeral: true })
    },
};
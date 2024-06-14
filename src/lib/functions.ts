import { GuildMember, Message, MessageComponentInteraction } from "discord.js";

export async function verifAuteur(interaction: MessageComponentInteraction, message:Message|undefined = undefined) {
    if (!message) 
        message = interaction.message;
    const member = interaction.member as GuildMember;
    const footer = message.embeds[0].footer ?? { text: "" };
    if (!footer.text.includes(`${member.user.id}`)) {
        interaction.reply({ content: "Tu n'es pas l'organisateur de cette partie.", ephemeral: true })
        return false;
    } else {
        if (message.reference && interaction.channel) {
            message = await interaction.channel.messages.fetch(message.reference.messageId ?? "");
            return verifAuteur(interaction, message)
        } else {
            return true;
        }
    }
};
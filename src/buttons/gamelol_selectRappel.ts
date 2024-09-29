import { GuildMember, MessageComponentInteraction, StringSelectMenuInteraction } from 'discord.js';
import { remindModel } from '../schemas/remindSchema.js';

export default {
    name: "selectRappel",
    async execute(interaction: MessageComponentInteraction) {
        const member = interaction.member as GuildMember;
        if (interaction.message.reference) {
            let referenceMessage = (await interaction.message.channel.messages.fetch(interaction.message.reference.messageId ?? ""))
            let interactiona = interaction as StringSelectMenuInteraction;
            let date = parseInt((referenceMessage.embeds[0].footer ?? { text: "" }).text.split('-')[1]) - (60 * parseInt(interactiona.values[0]));
            console.log(`${member.user.id} - ${new Date(date * 1000)} - ${referenceMessage.url}`)
            await remindModel.create({
                User: `${member.user.id}`,
                Time: new Date(date * 1000),
                url: referenceMessage.url,
            })
            interaction.update({ content: `Vous recevrez un message <t:${date}:R>`, components: [] });
        }
    },
};
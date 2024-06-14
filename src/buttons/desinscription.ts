import { EmbedBuilder, GuildMember, MessageComponentInteraction, strikethrough, userMention } from 'discord.js';
import { gameSignIn } from '../lib/buttons/gameSignIn.js';

export default {
    name: "desinscription",
    async execute(interaction: MessageComponentInteraction) {
        const member = interaction.member as GuildMember;
        const fieldInscrits = interaction.message.embeds[0].fields.length - 1;
        const mentionString = userMention(`${member.user.id}`);
        const rayeString = strikethrough(`${mentionString}`);
        const estInscrit = interaction.message.embeds[0].fields[fieldInscrits].value.includes(mentionString);
        const estRaye = interaction.message.embeds[0].fields[fieldInscrits].value.includes(rayeString);

        let oldEmbed = interaction.message.embeds[0];

        let condition1 = interaction.customId == 'inscription';

        if (!(condition1 !== (estInscrit && !(estRaye)))) {
            return interaction.reply({ content: `Tu ${condition1 ? 'es déja' : 'n\'es pas'} inscrit.`, ephemeral: true })
        }
        let newValue = condition1 ? // Si on s'inscrit
            oldEmbed.fields[fieldInscrits].value.includes(rayeString) ? // Si on est déja inscrit
                oldEmbed.fields[fieldInscrits].value.replace(rayeString, mentionString) : // On deraye
                oldEmbed.fields[fieldInscrits].value + `\n${mentionString}` : // sinon on ajoute
            oldEmbed.fields[fieldInscrits].value.replace(mentionString, rayeString); // si on se desinscrit on raye

        const tempEmbed2 = new EmbedBuilder(oldEmbed.toJSON())
            .setFields([
                ...oldEmbed.fields.slice(0, fieldInscrits),
                { name: " - Inscrits :", value: newValue }
            ]);
        interaction.message.edit({ embeds: [tempEmbed2], components: [gameSignIn] })
        interaction.reply({ content: `${condition1 ? "I" : "Dési"}nscrit !`, ephemeral: true })
    },
};
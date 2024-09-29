import { ActionRowBuilder, MessageComponentInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export default {
    name: "rappel",
    async execute(interaction: MessageComponentInteraction) {
        const select = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selectRappel')
                    .setPlaceholder('Séléctionnez un temps')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('5 minutes')
                            .setValue('5'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('15 minutes')
                            .setValue('15'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('30 minutes')
                            .setValue('30'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('1 heure')
                            .setValue('60'),
                    )
            );
        interaction.reply({ content: "Sélectionnez le temps avant la partie pour le rappel :", ephemeral: true, components: [select] });
    },
};
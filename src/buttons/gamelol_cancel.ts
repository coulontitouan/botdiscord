import { MessageComponentInteraction } from 'discord.js';
import verifAuteur from '../lib/functions/verifAuteur.js';

export default {
    name: "cancel",
    async execute(interaction: MessageComponentInteraction) {
        if (! await verifAuteur(interaction)) { return }
        interaction.reply({ content: "Annulée !", ephemeral: true })
    },
};
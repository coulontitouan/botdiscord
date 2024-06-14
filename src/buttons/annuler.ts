import { MessageComponentInteraction } from 'discord.js';
import { verifAuteur } from '../lib/functions.js';

export default {
    name: "annuler",
    async execute(interaction: MessageComponentInteraction) {
        if (! await verifAuteur(interaction)) { return }
        interaction.message.delete();
    },
};
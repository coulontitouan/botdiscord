import { MessageComponentInteraction } from 'discord.js';
import verifAuteur from '../lib/functions/verifAuteur.js';
import { gameSettings } from '../lib/buttons/gameSettings.js';

export default {
    name: "modifier",
    async execute(interaction: MessageComponentInteraction) {
        if (! await verifAuteur(interaction)) { return }
        interaction.reply({ components: [gameSettings] })
    },
};
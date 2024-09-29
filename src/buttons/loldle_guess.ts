import { MessageComponentInteraction } from 'discord.js';
import verifAuteur from '../lib/functions/verifAuteur.js';
import { gameSettings } from '../lib/buttons/gameSettings.js';
import { LolDleGame } from '../loldleGame.js';

export default {
    name: "loldle_hint",
    async execute(interaction: MessageComponentInteraction) {
        console.log(interaction.message)
        // LolDleGame.hint(interaction.message.attachments, interaction.user.id);
        interaction.reply('test');
    },
};  
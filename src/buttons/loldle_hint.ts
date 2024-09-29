import { MessageComponentInteraction } from 'discord.js';
import { LolDleGame, steps } from '../loldleGame.js';

export default {
    name: "loldle_hint",
    async execute(interaction: MessageComponentInteraction) {
        interaction.reply("Not yet implemented");
        //interaction.reply(LolDleGame.hint(interaction.message.embeds[0].image?.url.match(/\b(champion|spell|item)\b/)?.[0] as keyof typeof steps, interaction.user.id));
    },
};  
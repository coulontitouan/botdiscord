import { AutocompleteInteraction, ChatInputCommandInteraction, Guild, SlashCommandBuilder } from "discord.js";
import axios from 'axios';

interface ForgeableItem {
    name: string;
    duration: number;
    materials: { id: string; quantity: number }[];
}

const items: { [id: string]: ForgeableItem } = {
    'REFINED_DIAMOND': {
        name: 'Refined Diamond',
        duration: 8 * 60,
        materials: [
            { id: 'ENCHANTED_DIAMOND_BLOCK', quantity: 2 }
        ]
    },
    'REFINED_MITHRIL': {
        name: 'Refined Mithril',
        duration: 6 * 60,
        materials: [
            { id: 'ENCHANTED_MITHRIL', quantity: 160 }
        ]
    },
    
};

export default {
    data: new SlashCommandBuilder()
        .setName('forgehypixel')
        .setDescription("Planning de forge d'un item sur Hypixel")
        .addStringOption(option => option
            .setName('item')
            .setDescription("L'item à forger")
            .setRequired(true)
            .setChoices(
                Object.values(items).map(item => ({ name: item.name, value: item.value }))
            )
        )
        .addStringOption(option => option
            .setName('pseudo')
            .setDescription("Le pseudo de l'utilisateur")
            .setRequired(true)
        ),

    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused();
        const choices = [refinedDiamond, refinedMithril];
        const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.value })),
        );
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const username = interaction.options.getString('pseudo');
        const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).catch(
            () => { interaction.reply(`Le pseudo ${username} n'existe pas.`); }
        );
        if (!response) return;

        const uuid = response.data.id;

        const itemValue = interaction.options.getString('item');
        console.log(itemValue);

        return interaction.reply(uuid);
    },
};
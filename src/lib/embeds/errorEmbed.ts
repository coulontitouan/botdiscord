import { EmbedBuilder } from "discord.js";
import CustomEmbedOptions from "./options.js";

export function errorEmbed({ title = "Erreur", description }: CustomEmbedOptions) {
    return new EmbedBuilder().setColor(0xFF0000).setTitle(title).setDescription(description)
}
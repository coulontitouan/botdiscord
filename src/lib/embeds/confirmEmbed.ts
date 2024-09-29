import { EmbedBuilder } from "discord.js";
import CustomEmbedOptions from "./options.js";

export function confirmEmbed({ title = "Confirmation", description }: CustomEmbedOptions) {
    return new EmbedBuilder().setColor(0x00FF00).setTitle(title).setDescription(description)
}
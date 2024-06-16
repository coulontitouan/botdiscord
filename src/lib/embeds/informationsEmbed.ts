import { EmbedBuilder } from "discord.js";
import CustomEmbedOptions from "./options.js";

export function informationEmbed({ title = "Information", description }: CustomEmbedOptions) {
    return new EmbedBuilder().setColor(0x2B2D31).setTitle(title).setDescription(description).setThumbnail("https://i.imgur.com/hdOhUoh.png")
}
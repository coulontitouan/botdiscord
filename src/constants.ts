import { EmbedBuilder } from "discord.js";

export enum Scopes {
    DM = 'dm',
    GUILD = 'guild',
    RATIO = 'ratio'
}

export function errorEmbed(title: string = "Erreur", error: string) {
    return new EmbedBuilder().setColor(0xFF0000).setTitle(title).setDescription(error)
}

export function informationEmbed(title: string = "Information", information: string) {
    return new EmbedBuilder().setColor(0x2B2D31).setTitle(title).setDescription(information).setThumbnail("https://i.imgur.com/hdOhUoh.png")
}

export const AdminEmbed = informationEmbed("Permissions manquantes", "Vous devez être administrateur pour utiliser cette commande")

export const WrongGuildEmbed = informationEmbed("Mauvais serveur", "Vous devez être sur le serveur RATIO pour utiliser cette commande")


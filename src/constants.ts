import { informationEmbed } from "./lib/embeds/informationsEmbed.js";

export enum Scopes {
    DM = 'dm',
    GUILD = 'guild',
    RATIO = 'ratio'
}

export const AdminEmbed = informationEmbed({
    title: "Permissions manquantes",
    description: "Vous devez être administrateur pour utiliser cette commande"
})

export const WrongGuildEmbed = informationEmbed({
    title: "Mauvais serveur",
    description: "Vous devez être sur le serveur RATIO pour utiliser cette commande"
})


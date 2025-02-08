import { informationEmbed } from "./lib/embeds/informationsEmbed.js";
import dotenv from 'dotenv';
dotenv.config();

export const CLIENT_ID = process.env.CLIENT_ID as string;
export const GUILD_ID = process.env.GUILD_ID as string;
export const TOKEN = process.env.TOKEN as string;
export const LOL_API_KEY = process.env.LOL_API_KEY as string;
export const TFT_API_KEY = process.env.TFT_API_KEY as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;

export const AdminEmbed = informationEmbed({
    title: "Permissions manquantes",
    description: "Vous devez être administrateur pour utiliser cette commande"
})

export const WrongGuildEmbed = informationEmbed({
    title: "Mauvais serveur",
    description: "Vous devez être sur le serveur RATIO² pour utiliser cette commande"
})


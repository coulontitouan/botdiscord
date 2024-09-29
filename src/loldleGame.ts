import axios from "axios"
import mosaicify from "./lib/functions/mosaicify.js"

export const steps = {
    champion: 1,
    item: 2,
    spell: 3
}

const TagsTranslated = {
    Tank: "Tank",
    Support: "Support",
    Assassin: "Assassin",
    Mage: "Mage",
    Marksman: "Tireur",
    Fighter: "Combattant"
}

export interface ChampionWrapper {
    id: string,
    key: string,
    name: string,
    title: string,
    tags: Array<keyof typeof TagsTranslated>,
    partype: string
}

export interface ItemWrapper {
    id: string
    name: string
    price: number
    plaintext: string
}

export interface SpellWrapper {
    champion: string
    name: string
    mana: number
    key: string[1]
}

export class LolDleGame {
    static version: string;
    static championStep: { champion: ChampionWrapper, image: string | null };
    static itemStep: { item: ItemWrapper, image: string | null };
    static spellStep: { spell: SpellWrapper, image: string | null };
    static answered: { [step in keyof typeof steps]: string[] } = { champion: [], item: [], spell: [] };
    static hints: { [user: string]: { [step in keyof typeof steps]: boolean } } = {};

    static async updateVersion() {
        return this.version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json').then(
            response => response.data[0]
        );
    }

    static hint(step: keyof typeof steps, user: string) {
        this.hints[user] = this.hints[user] ?? []
        this.hints[user][step] = true;
        switch (step) {
            case "champion":
                console.log(this.championStep.champion.tags);
                return this.championStep.champion.tags.forEach(tag => TagsTranslated[tag]);
                return this.championStep.champion.tags.join(", ");
        }
        return "test"
    }

    static async todayImage(difficulty: number) {
        return this.championStep.image ?? await mosaicify(
            await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.version}/img/champion/${this.championStep.champion.id}.png`,
                { responseType: 'arraybuffer' })
                .then(response => response.data),
            difficulty * 3)
    }

    static async newChampion() {
        this.answered.champion = [];
        await this.updateVersion();
        const champion: ChampionWrapper[] = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.version}/data/fr_FR/champion.json`).then(
            response => response.data.data
        );
        const champions = Object.values(champion);
        this.championStep = { champion: champions[Math.floor(Math.random() * champions.length)], image: null };
    }

    static async getAllChampions() {
        await this.updateVersion();
        return await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.version}/data/fr_FR/champion.json`).then(response => {
            return Object.values<ChampionWrapper>(response.data.data).map((champion: ChampionWrapper) => champion.name);
        }
        );
    }
}
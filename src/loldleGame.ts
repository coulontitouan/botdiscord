import axios from "axios"
import mosaicify from "./lib/functions/mosaicify.js"

export interface Champion {
    id: string
    key: string
    name: string
    title: string
    tags: string[2]
    partype: string
}

export class LolDleGame {
    static version: string;
    static champion: Champion;
    static answered: string[];

    static async todayImage(difficulty: number) {
        return await mosaicify(
            await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.version}/img/champion/${this.champion.id}.png`,
                { responseType: 'arraybuffer' })
                .then(response => response.data),
            difficulty * 3)
    }

    static async updateVersion() {
        return this.version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json').then(
            response => response.data[0]
        );
    }

    static async newChampion() {
        this.answered = [];
        await this.updateVersion();
        const champion: Champion[] = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${this.version}/data/fr_FR/champion.json`).then(
            response => response.data.data
        );
        const champions = Object.values(champion);
        this.champion = champions[Math.floor(Math.random() * champions.length)];
    }
}
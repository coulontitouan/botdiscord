import { Client, ClientUser, Events, Guild } from 'discord.js';
import mongoose from 'mongoose';
import cron from "cron";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        const user = client.user as ClientUser;
        console.log(`${user.tag} est prêt!`);

        const connected = await mongoose.connect(process.env.MONGODB_URI ?? "");

        console.log(connected ? "Connecté à la base de données !" : "Erreur lors de la connexion à la base de données !")

        const Guild = client.guilds.cache.get("1017742904753655828") as Guild;
        let botNumber = 0;
        const Members = Guild.members.cache.map(member => {
            if (member.user.bot == false) { return member.user.username } botNumber += 1
        });

        for (let i = 0; i < botNumber; i++) {
            Members.splice(Members.indexOf(undefined), 1)
        };

        setInterval(() => {
            const status = Members[Math.floor(Math.random() * Members.length)];
            user.setPresence({ activities: [{ name: `${status}`, type: 3 }] });
        }, 10000);

        client.users.fetch('524926551431708674').then(livreur => livreur.send("Prêt !"));
    },
};
const { Events } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        console.log(`${client.user.tag} est prêt!`);

        await mongoose.connect(process.env.MONGODB_URI);

        if (mongoose.connect){
            console.log("Connecté à la base de données !");
        }else{
            console.log("Erreur lors de la connexion à la base de données !");
        }

        const Guild = client.guilds.cache.get("1017742904753655828");
        let botNumber = 0;
        const Members = Guild.members.cache.map(member => {
            if (member.user.bot == false) { return member.user.username } botNumber += 1
        });
    
        for (let i = 0; i < botNumber; i++) {
            Members.splice(Members.indexOf(undefined), 1)
        };
    
        setInterval(() => {
            const status = Members[Math.floor(Math.random() * Members.length)];
            client.user.setPresence({ activities: [{ name: `${status}`, type: 3 }] });
        }, 10000);
    
        client.users.fetch('524926551431708674').then(livreur => livreur.send("Prêt !"));
	},
};
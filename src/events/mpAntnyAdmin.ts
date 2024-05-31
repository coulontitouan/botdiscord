const { Events, PermissionsBitField } = require('discord.js');
const client = require("../index.js");

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const antnyID = '366142323966476290';
        const eythurID = '386256159725846529';

        if (!(oldMember.permissions.has(PermissionsBitField.Flags.Administrator)) && newMember.permissions.has(PermissionsBitField.Flags.Administrator) && newMember.id === antnyID) {
            const eythur = await client.users.fetch(eythurID)
            await eythur.send("ANTHONY EST BIG BOSS : VOUS ÊTES EN MAJORITÉ GÂTÉ !\n" +
                              "40) Le racisme, sous toutes ses formes, est un crime intolérable : quiconque commettant ce crime sera temporairement exclue du serveur.\n" +
                              "41) Une accusation de racisme est une accusation particulièrement grave ne pouvant être prise à la légère. Elle doit être appuyée par des preuves réelles, tangibles, formelles, vérifiables, indiscutables, incontestables, irréfutables, indéniables, inébranlables et inattaquables, et non par des suppositions, des hypothèses, des suspicions, des présomptions, des conjectures, des spéculations, des supputations, des préjugés, des préventions, des partis pris, des idées reçues, ou des à priori. Une accusation de racisme sans preuve est passible de très lourdes sanctions.")
        }
    },
};
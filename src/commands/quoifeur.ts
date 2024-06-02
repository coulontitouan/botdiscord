import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, roleMention } from 'discord.js';
import fs from "fs";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quoifeur')
        .setDescription('Réponds, ou non, aux quoi-feur etc')
        .addBooleanOption(option =>
            option.setName('statut')
                .setDescription('Le nouveau statut')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const fichier = "./config/configReglages.json"
        let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

        if (member.roles.resolve("1104446622043209738")) {
            configJSON["quoifeur"] = interaction.options.getBoolean("statut") == null ? !configJSON["quoifeur"] : interaction.options.getBoolean("statut");
            fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2));
            return interaction.reply({
                content: `Le statut des quoi-feur est maintenant ${configJSON["quoifeur"] ? "activé" : "désactivé"}`
            })
        }
        interaction.reply({
            content: `Les personnes n'ayant pas le rôle ${roleMention("1104446622043209738")} ne peuvent pas changer le statut des quoi-feur.`,
            ephemeral: true
        })
    },
}
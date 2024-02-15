const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deban')
        .setDescription('Active le !debanmoi')
        .addBooleanOption(option =>
            option.setName('statut')
                .setDescription('Le nouveau statut')
                .setRequired(false)),
    async execute(interaction) {
        const fichier = "./config/configReglages.json"
        let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || interaction.member.user.id == "524926551431708674") {
            configJSON["debanmoi"] = interaction.options.getBoolean("statut") == null ? !configJSON["debanmoi"] : interaction.options.getBoolean("statut");
            fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2));
            return interaction.reply({
                content: `Le !debanmoi est ${configJSON["debanmoi"] ? "activé" : "désactivé"}`
            })
        }
        interaction.reply({
            content: `Seuls les admins peuvent désactiver le !debanmoi.`,
            ephemeral: true
        })
    },
}
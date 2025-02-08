import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBooleanOption } from 'discord.js';
import fs from "fs";

const option = new SlashCommandBooleanOption()
    .setName('statut')
    .setDescription('Le nouveau statut')
    .setRequired(false);

export default {
    data: new SlashCommandBuilder()
        .setName('toggle')
        .setDescription('Active ou désactive une fonctionnalité')
        .addSubcommand(subcommand =>
            subcommand.setName('debanmoi')
                .setDescription('Active la commande debanmoi')
                .addBooleanOption(option)
        )
        .addSubcommand(subcommand =>
            subcommand.setName('quoifeur')
                .setDescription('Réponds, ou non, aux quoi-feur etc')
                .addBooleanOption(option)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const permissions = member.permissions as PermissionsBitField;

        const subcommand = interaction.options.getSubcommand();
        const status = interaction.options.getBoolean("statut");
        

        const fichier = "./config/configReglages.json"
        let configJSON = JSON.parse(fs.readFileSync(fichier, "utf-8"));

        if (permissions.has(PermissionFlagsBits.Administrator) || member.user.id === "524926551431708674") {
            configJSON[subcommand] = status === null ? !configJSON[subcommand] : status;
            fs.writeFileSync(fichier, JSON.stringify(configJSON, null, 2));
            return interaction.reply({
                content: `Le ${subcommand} est ${configJSON[subcommand] ? "activé" : "désactivé"}`
            })
        }
        interaction.reply({
            content: `Seuls les admins peuvent désactiver le debanmoi.`,
            ephemeral: true
        })
    },
}
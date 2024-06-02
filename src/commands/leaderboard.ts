import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Donne le classement des membres du serveur selon leurs points NGR.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;

        // Vérifie si le serveur est le bon
        if (member.guild.id !== "1017742904753655828") {
            return await interaction.reply({ content: "Mauvais serveur", ephemeral: true });
        }

        return await interaction.reply("pas encore faite");
    },
};
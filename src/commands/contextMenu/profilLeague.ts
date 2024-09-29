import { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, userMention, ContextMenuCommandType } from "discord.js";
import profil from "../profilLeague.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName('Profil League of Legends')
        .setType(ApplicationCommandType.User as ContextMenuCommandType),
    async execute(interaction: UserContextMenuCommandInteraction) {
        return interaction.reply({ embeds: [await profil.league({ pseudo: userMention(interaction.targetUser.id), tag: interaction.targetUser.tag, discordId: interaction.targetUser.id })] })
    }
};

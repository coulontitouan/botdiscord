import { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, ContextMenuCommandType } from "discord.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName('Photo de profil')
        .setType(ApplicationCommandType.User as ContextMenuCommandType),
    async execute(interaction: UserContextMenuCommandInteraction) {
        return interaction.reply(interaction.targetUser.displayAvatarURL({ size: 4096 }));
    }
};

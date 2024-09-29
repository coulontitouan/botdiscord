import { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName('Photo de profil')
        .setType(ApplicationCommandType.User),
    async execute(interaction: UserContextMenuCommandInteraction) {
        return interaction.reply(interaction.targetUser.displayAvatarURL({ size: 4096 }));
    }
};

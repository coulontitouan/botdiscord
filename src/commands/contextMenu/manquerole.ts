import { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, Guild, GuildMember, InteractionContextType } from "discord.js";
import role from "../manquerole.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName('Manque rôles')
        .setType(ApplicationCommandType.User)
        .setContexts([InteractionContextType.Guild]),
    async execute(interaction: UserContextMenuCommandInteraction) {
        return interaction.reply({ embeds: [await role.getEmbed(interaction.guild as Guild, interaction.targetMember as GuildMember)] })
    }
};

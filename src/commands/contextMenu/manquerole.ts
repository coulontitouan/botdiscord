import { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, Guild, GuildMember } from "discord.js";
import role from "../manquerole.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName('Manque rôles')
        .setType(ApplicationCommandType.User),
    async execute(interaction: UserContextMenuCommandInteraction) {
        return interaction.reply({ embeds: [await role.getEmbed(interaction.guild as Guild, interaction.targetMember as GuildMember)] })
    }
};

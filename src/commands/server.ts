import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Donne les informations sur le serveur'),
    async execute(interaction) {

        // Récupere le serveur et le bot
        const guild = interaction.guild
        let bot = await interaction.guild.members.fetch(interaction.client.application.id)

        // Compte les salons sans les catégories
        let countChannel = 0
        let salonsRaw = (await guild.channels.fetch())

        salonsRaw.forEach(ch => {
            if (ch.type != 4) {
                countChannel += 1
            }
        })

        // Construction du message final
        let embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setDescription("Membres : " + guild.memberCount + "\n"
                + "Salons : " + countChannel + "\n"
                + "Propriétaire : " + "<@" + guild.ownerId + ">" + "\n"
            )
            .setThumbnail(guild.iconURL())
            .setColor(bot.displayHexColor)

        try {
            let wyatt = await bot.guild.members.fetch('599524864692584454')
            embed.setFooter({ text: "Il est où Wyatt ?", iconURL: wyatt.user.displayAvatarURL() })
        }
        catch (error) {
            // Si Wyatt n'a pas été trouvé, ne rien faire.
        }

        interaction.reply({ embeds: [embed] })
    },
};
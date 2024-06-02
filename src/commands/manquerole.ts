import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manque')
        .setDescription('Affiche les rôles qui manque à un utilisateur')
        .addUserOption(option => option
            .setName('utilisateur')
            .setDescription('L\'utilisateur dont il faut vérifier les rôles')
            .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        let user = interaction.options.getMember('utilisateur') as GuildMember;
        if (user === null) {
            interaction.reply("Cette personne n'est pas sur le serveur.")
        } else {
            let nom = user.user.username
            if (user.nickname) {
                nom = user.nickname
            }

            let embed = new EmbedBuilder()
                .setTitle(`Liste exhaustive des rôles que ${nom} n'a pas sur le serveur `)
                .setDescription(" ")
                .setColor(0xFF0000)

            let roleGuild = {}
            user.guild.roles.cache.forEach(role => {
                if (!role.managed && role.name !== "@everyone") {
                    roleGuild[role.id] = role.name
                }
            })

            //let count = 1
            for (let role of Object.keys(roleGuild)) {
                if (!user.roles.resolve(role)) {
                    embed.setDescription(`${embed.data.description}\n<@&${role}>`)
                    //embedeee.addFields({name : count.toString(), value: "<@&" + role + ">"})
                    //count+=1
                }
                else {
                    delete roleGuild[role]
                }
            }

            const nombreDeRoles = Object.keys(roleGuild).length
            if (nombreDeRoles === 0) {
                embed.setTitle(`${nom} possède tous les rôles !`)
                    .setColor(0x00FF00)
            }
            else {
                embed.setTitle(`${embed.data.title}(${nombreDeRoles}) :`)
            }
            // Envoi du message
            interaction.reply({ embeds: [embed] })
        }
    },
};
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Guild, GuildMember, roleMention } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('manque')
        .setDescription('Affiche les rôles qui manque à un utilisateur')
        .addUserOption(option => option
            .setName('utilisateur')
            .setDescription('L\'utilisateur dont il faut vérifier les rôles')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild as Guild;
        let user = (interaction.options.getMember("utilisateur") ?? interaction.member) as GuildMember;
        console.log(user)

        let nom = user.nickname ?? user.user.username;

        let embed = new EmbedBuilder()
            .setTitle(`Liste exhaustive des rôles que ${nom} n'a pas sur le serveur `)
            .setDescription(null)
            .setColor(0xFF0000)

        let roleGuild: { [id: string]: string } = {}
        guild.roles.cache.forEach(role => {
            if (!role.managed && role.name !== "@everyone") {
                roleGuild[role.id] = role.name
            }
        })

        for (let role of Object.keys(roleGuild)) {
            if (!user.roles.resolve(role)) {
                embed.setDescription(`${embed.data.description}\n${roleMention(role)}`)
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
    },
};
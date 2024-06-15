import axios from "axios";
import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, AttachmentBuilder, chatInputApplicationCommandMention } from "discord.js";

interface Champion {
    id: string
    key: string
    name: string
    title: string
    tags: string[2]
    partype: string
}

export default {
    data: new SlashCommandBuilder()
        .setName('loldle')
        .setDescription('Permet de répondre au LolDle du jour.')
        .addSubcommandGroup(subcommand => subcommand
            .setName('config')
            .setDescription('Permet de configurer le LolDle')
            .addSubcommand(subcommand => subcommand
                .setName('channel')
                .setDescription('Permet de configurer le salon où le LolDle sera envoyé')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('Le salon où le LolDle sera envoyé')
                    .setRequired(true)
                    .addChannelTypes(ChannelType.GuildText)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('time')
                .setDescription("Permet de configurer l'heure à laquelle le LolDle sera envoyé")
                .addStringOption(option => option
                    .setName('time')
                    .setDescription("L'heure à laquelle le LolDle sera envoyé (format HH:MM)")
                    .setRequired(true)
                )
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('guess')
            .setDescription('Permet de répondre au LolDle du jour')
            .addStringOption(option => option
                .setName('reponse')
                .setDescription('La réponse au LolDle du jour')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('get')
            .setDescription('Renvoie le message du LolDle du jour')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand(true)) {
            case 'config':
                await this.config(interaction);
                break;
            case 'guess':
                await this.guess(interaction);
                break;
            case 'get':
                await this.get(interaction);
                break;
            default:
                break;
        }
    },
    async config(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand(true);
        const member = interaction.member as GuildMember;
        const channel = interaction.options.getChannel('channel', true);
        const time = interaction.options.getString('time', true);
        interaction.reply({ content: `Configuration du LolDle : ${subcommand} ${channel} ${time}`, ephemeral: true });
    },
    async guess(interaction: ChatInputCommandInteraction) {
        const reponse = interaction.options.getString('reponse', true);
        const { currentChampion } = await import("../index.js");
        return interaction.reply({ content: `${currentChampion.id}`, ephemeral: true });
        if (reponse.toLowerCase() === currentChampion.toString().toLowerCase()) {
            interaction.reply({ content: 'Bravo !', ephemeral: true });
        } else {
            interaction.reply({ content: 'Dommage !', ephemeral: true });
        }
    },
    async get(interaction: ChatInputCommandInteraction) {
        const version: string = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json').then(
            response => response.data[0]
        );
        const { currentChampion } = await import("../index.js");
        const file = new AttachmentBuilder(await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${currentChampion.id}.png`, { responseType: 'arraybuffer' }).then(response => response.data)).setName(`${currentChampion.key}.png`);
        const LoLDleEmbed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle('LolDle du jour')
            .setDescription('Qui suis-je ?')
            .addFields({ name: 'Répondez avec', value: chatInputApplicationCommandMention("loldle", "guess", interaction.commandId), inline: true })
            .setImage(`attachment://${file.name}`);
        interaction.reply({ embeds: [LoLDleEmbed], files: [file] });
    }
};
import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, AttachmentBuilder, chatInputApplicationCommandMention, time } from "discord.js";
import { LolDleGame } from "../loldleGame.js";
import { confirmEmbed } from "../lib/embeds/confirmEmbed.js";
import { errorEmbed } from "../lib/embeds/errorEmbed.js";

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
        const currentChampion = LolDleGame.champion;
        const reponse = interaction.options.getString('reponse', true);
        if (LolDleGame.answered.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Vous avez déjà répondu à ce LolDle !', ephemeral: true });
        } else {
            LolDleGame.answered.push(interaction.user.id);
            let embed;
            if (reponse.toLowerCase() === currentChampion.name.toLowerCase()) {
                embed = confirmEmbed({
                    title: "Réponse correcte !",
                    description: `La réponse était bien ${currentChampion.name} !`
                });
            } else {
                embed = errorEmbed({
                    title: "Réponse incorrecte !",
                    description: `La réponse était ${currentChampion.name} !`
                });
            }
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
    async get(interaction: ChatInputCommandInteraction) {
        const difficulty = 3; // interaction.options.getInteger('difficulty', false) ?? 3;
        const file = new AttachmentBuilder(await LolDleGame.todayImage(difficulty))
            .setName(`${Math.floor(new Date().getTime() / 86400000) * 86400}.png`);
        const LoLDleEmbed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`LolDle du ${time(new Date(), "D")}`)
            .setDescription('Qui suis-je ?')
            .addFields({ name: 'Répondez avec', value: chatInputApplicationCommandMention("loldle", "guess", interaction.commandId), inline: true })
            .setImage(`attachment://${file.name}`);
        interaction.reply({ embeds: [LoLDleEmbed], files: [file] });
    }
};
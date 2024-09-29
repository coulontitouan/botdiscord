import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, AttachmentBuilder, chatInputApplicationCommandMention, time, GuildTextBasedChannel, GuildBasedChannel, Channel, TextChannel, ButtonBuilder, ActionRowBuilder, ButtonStyle, AutocompleteInteraction } from "discord.js";
import { LolDleGame, steps } from "../loldleGame.js";
import { confirmEmbed } from "../lib/embeds/confirmEmbed.js";
import { errorEmbed } from "../lib/embeds/errorEmbed.js";
import configJSON from "../../config/loldle.json" with { type: "json" };
import fs from "node:fs";

const fichier = "config/loldle.json";

interface LolDleConfigOptions {
    channel: TextChannel,
    time: string,
    difficulty: number
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
            .addSubcommand(subcommand => subcommand
                .setName('difficulty')
                .setDescription("Permet de configurer la difficulté du LolDle")
                .addIntegerOption(option => option
                    .setName('difficulty')
                    .setDescription("La difficulté du LolDle (1, 2 ou 3)")
                    .setRequired(true)
                    .addChoices([
                        { name: '1 - Facile', value: 1 },
                        { name: '2 - Moyen', value: 2 },
                        { name: '3 - Difficile', value: 3 }
                    ])
                )
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('guess')
            .setDescription('Permet de répondre au LolDle du jour')
            .addStringOption(option => option
                .setName('reponse')
                .setDescription('Ta réponse au LolDle du jour')
                .setRequired(true)
                .setAutocomplete(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('get')
            .setDescription('Renvoie le message du LolDle du jour')
            .addIntegerOption(option => option
                .setName('step')
                .setDescription('L\'étape désirée du LolDle')
                .setRequired(false)
                .addChoices([
                    { name: '1 - Champion', value: 1 },
                    { name: '2 - Item', value: 2 },
                    { name: '3 - Sort', value: 3 }
                ])
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('stats')
            .setDescription('Renvoie les statistiques du LolDle du jour')
        )
        .addSubcommand(subcommand => subcommand
            .setName('reset')
            .setDescription('Reset le LolDle du jour')
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused();
        const champions = await LolDleGame.getAllChampions();

        return await interaction.respond(
            champions
                .filter(choice => choice.toLowerCase().match(focusedValue.toLowerCase().split('').join('.*')))
                .map(choice => ({ name: choice, value: choice }))
                .slice(0, 25)
        );
    },
    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommandGroup()) {
            case 'config':
                const channel: TextChannel = interaction.options.getChannel('channel', false) ?? await interaction.client.channels.fetch(configJSON.channel, { force: true }) as TextChannel;
                const time = interaction.options.getString('time', false) ?? configJSON.time;
                const difficulty = interaction.options.getInteger('difficulty', false) ?? configJSON.difficulty;
                interaction.reply(await this.config({ channel: channel, time: time, difficulty: difficulty }));
                break;
            default:
                switch (interaction.options.getSubcommand(true)) {
                    case 'guess':
                        await this.guess(interaction);
                        break;
                    case 'get':
                        await this.get(interaction);
                        break;
                    case 'stats':
                        await this.stats(interaction);
                        break;
                    case 'reset':
                        await this.reset(interaction);
                        break;
                }
                break;
        }
    },
    async config(config: LolDleConfigOptions) {
        fs.writeFileSync(fichier, JSON.stringify({ channel: config.channel.id, time: config.time, difficulty: config.difficulty }, null, 2));
        return { content: `Configuration du LolDle : ${config.channel} ${config.time} ${config.difficulty}`, ephemeral: true };
    },
    async guess(interaction: ChatInputCommandInteraction) {
        const currentChampion = LolDleGame.championStep.champion;
        const reponse = interaction.options.getString('reponse', true);
        if (LolDleGame.answered.champion.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Vous avez déjà répondu à ce LolDle !', ephemeral: true });
        } else {
            LolDleGame.answered.champion.push(interaction.user.id);
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

        let image: string;
        let file: AttachmentBuilder | null = null;

        const step = interaction.options.getInteger('step', false) ?? 1;
        let LoLDleEmbed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`LolDle du ${time(new Date(), "D")}`);
        switch (step) {
            case 1:
                if (!LolDleGame.championStep.image) {
                    file = new AttachmentBuilder(await LolDleGame.todayImage(configJSON.difficulty)).setName(`champion.png`);
                    image = `attachment://${file.name}`;
                } else {
                    image = LolDleGame.championStep.image;
                }

                LoLDleEmbed.setDescription(`Etape ${step}/3 : Trouvez le champion`)
                    .addFields({ name: 'Qui est ce champion ?', value: chatInputApplicationCommandMention("loldle", "guess", interaction.commandId), inline: true })
                    .setImage(image);
                break;
            case 2:
                /*
                if (!LolDleGame.championStep.image) {
                    file = new AttachmentBuilder(await LolDleGame.todayImage(configJSON.difficulty))
                        .setName(`${Math.floor(new Date().getTime() / 86400000) * 86400}.png`);
                    image = `attachment://${file.name}`;
                } else {
                    image = LolDleGame.championStep.image;
                }
    
                LoLDleEmbed = new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`LolDle du ${time(new Date(), "D")}`)
                    .setDescription(`Etape ${step}/3 : Trouvez le champion`)
                    .addFields({ name: 'Qui est ce champion ?', value: chatInputApplicationCommandMention("loldle", "guess", interaction.commandId), inline: true })
                    .setImage(image);
                */
                break;
            case 3:
                /*
                if (!LolDleGame.championStep.image) {
                    file = new AttachmentBuilder(await LolDleGame.todayImage(configJSON.difficulty))
                        .setName(`${Math.floor(new Date().getTime() / 86400000) * 86400}.png`);
                    image = `attachment://${file.name}`;
                } else {
                    image = LolDleGame.championStep.image;
                }
    
                LoLDleEmbed = new EmbedBuilder()
                    .setColor(0x2B2D31)
                    .setTitle(`LolDle du ${time(new Date(), "D")}`)
                    .setDescription(`Etape ${step}/3 : Trouvez le champion`)
                    .addFields({ name: 'Qui est ce champion ?', value: chatInputApplicationCommandMention("loldle", "guess", interaction.commandId), inline: true })
                    .setImage(image);
                */
                break;
        }

        const boutons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('loldle_guess')
                    .setLabel('Répondre')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('loldle_hint')
                    .setLabel('Indice')
                    .setStyle(ButtonStyle.Success)
            );

        let reply = await interaction.reply({ embeds: [LoLDleEmbed], files: file ? [file] : [], components: [boutons], fetchReply: true })
        LolDleGame.championStep.image = reply.embeds[0].image?.url ?? "";
    },
    async stats(interaction: ChatInputCommandInteraction) {
        const statsEmbed = new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle(`Statistiques du jour`)
            .setDescription(LolDleGame.version)
            .addFields(
                { name: 'Champion', value: LolDleGame.championStep.champion.name, inline: true },
            )
            .setImage(LolDleGame.championStep.image);

        interaction.reply({ embeds: [statsEmbed] });
    },
    async reset(interaction: ChatInputCommandInteraction) {
        await LolDleGame.newChampion();
        interaction.reply({ content: 'LolDle reset !', ephemeral: true });
    }
};
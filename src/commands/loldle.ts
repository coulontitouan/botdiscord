import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, AttachmentBuilder, chatInputApplicationCommandMention, time, AutocompleteInteraction } from "discord.js";
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
            .addSubcommand(subcommand => subcommand
                .setName('difficulty')
                .setDescription("Permet de configurer la difficulté du LolDle")
                .addIntegerOption(option => option
                    .setName('difficulty')
                    .setDescription("La difficulté du LolDle (1, 2 ou 3)")
                    .setRequired(true)
                    .addChoices([
                        {name:'Facile',value: 1},
                        {name:'Moyen', value: 2},
                        {name:'Difficile', value: 3}
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
                await this.config(interaction);
                break;
            default:
                switch (interaction.options.getSubcommand(true)) {
                    case 'guess':
                        await this.guess(interaction);
                        break;
                    case 'get':
                        await this.get(interaction);
                        break;
                }
                break;
        }
    },
    async config(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand(true)) {
            case 'channel':
                // await this.configChannel(interaction);
                break;
            case 'time':
                // await this.configTime(interaction);
                break;
            case 'difficulty':
                // await this.configDifficulty(interaction);
                break;
            default:
                interaction.reply({ content: 'Sous-commande inconnue', ephemeral: true });
                break;
        }
        const channel = interaction.options.getChannel('channel');
        const time = interaction.options.getString('time');
        interaction.reply({ content: `Configuration du LolDle : ${channel} ${time}`, ephemeral: true });
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
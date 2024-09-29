import { ChatInputCommandInteraction, Guild, GuildMember, SlashCommandBuilder, time, channelMention, EmbedBuilder, userMention, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, AutocompleteInteraction } from 'discord.js';

enum modes {
    FLEX = "Flex",
    CLASH = "Clash",
    CUSTOM = "Personnalisée",
    ARENA = "Arena",
}

enum dateFormats {
    D = "D",
    F = "F",
    t = "t",
    R = "R",
}

const DayOfWeek: { [key: number]: string } = {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi"
};

export default {
    data: new SlashCommandBuilder()
        .setName("game")
        .setDescription("undefined")
        .addSubcommand(command => command
            .setName("lol")
            .setDescription("Organise une partie sur LoL.")
            .addStringOption(option => option
                .setName("type")
                .setDescription("Type de partie")
                .addChoices(
                    Object.values(modes).map(mode => { return { name: mode, value: mode } })
                )
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName("heure")
                .setDescription("Heure de la partie (format : 00h00 ou 00h)")
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName("date")
                .setDescription("Date de la partie (format : jj/mm/aaaa)")
                .setRequired(false)
                .setAutocomplete(true)
            )
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused();
        const dates = [];
        const now = new Date();

        for (let i = 1; i <= 7; i++) {
            const nextDate = new Date();
            nextDate.setDate(now.getDate() + i);

            const day = String(nextDate.getDate()).padStart(2, '0');
            const month = String(nextDate.getMonth() + 1).padStart(2, '0'); // January is 0!
            const year = nextDate.getFullYear();

            const formattedDate = `${day}/${month}/${year}`;
            dates.push({ day: `${DayOfWeek[nextDate.getDay()]}`, date: `${formattedDate}` });
        }
        return await interaction.respond(
            dates
                .filter(choice => choice.day.toLowerCase().startsWith(focusedValue.toLowerCase()))
                .map(choice => ({ name: `${choice.date} - ${choice.day}`, value: choice.date }))
        );
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const guild = interaction.guild as Guild;

        // Vérifie si le serveur est le bon
        if (member.guild.id !== "1017742904753655828") {
            return await interaction.reply({ content: "Mauvais serveur", ephemeral: true });
        }

        const mode = interaction.options.getString("type", true);
        const date = interaction.options.getString("date", false);
        const heure_minute = interaction.options.getString("heure", false);
        const now = new Date();

        let dateEvent: Date | null = null, lettre: dateFormats = dateFormats.F;
        if (date || heure_minute) {
            const regexDate = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])(?:\/\d{4})?$/;
            const regexHeure = /^(2[0-3]|(1|0?)\d)(h([0-5]\d)?|[:\s][0-5]\d)?$/;
            let [jour, mois, annee, heure, minute]: number[] = [];

            function getIntoNumber(parts: (string | number)[]) {
                return parts.map(param => parseInt(param.toString()));
            }

            if (date) {
                lettre = dateFormats.D;
                if (regexDate.test(date)) {
                    [jour, mois, annee] = getIntoNumber(date.length > 5 ? date.split('/') : [...date.split('/'), now.getFullYear()]);
                } else {
                    return await interaction.reply({ content: "Format de date invalide", ephemeral: true })
                }
            }
            if (heure_minute) {
                lettre = lettre === dateFormats.D ? dateFormats.F : dateFormats.t;
                if (regexHeure.test(heure_minute)) {
                    [heure, minute] = getIntoNumber(heure_minute.split('h'));
                    if (heure < now.getHours() || (heure === now.getHours() && minute < now.getMinutes())) {
                        jour = jour ?? now.getDate() + 1;
                    }
                } else {
                    return await interaction.reply({ content: "Format d'heure invalide", ephemeral: true })
                }
            }

            jour = jour ?? now.getDate();
            mois = mois ?? now.getMonth() + 1;
            annee = annee ?? now.getFullYear();
            heure = heure ?? "00";
            minute = minute ?? "00";

            dateEvent = new Date(annee, mois - 1, jour, heure, minute);

            if (dateEvent < now) {
                return await interaction.reply({ content: "Date antérieure à aujourd'hui", ephemeral: true })
            }
        }

        const bot = await guild.members.fetch(interaction.client.application.id)

        const fields: { name: string, value: string }[] = [];
        fields.push({ name: " - Type de partie :", value: mode })
        if (dateEvent) {
            fields.push({ name: " - Date et heure :", value: time(dateEvent, dateFormats.F) })
        }
        else dateEvent = now;
        fields.push({ name: " - Inscrits :", value: `${userMention(`${member.user.id}`)}\n` })

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setEmoji('<:agree:1200004575785140254>')
            .setLabel('Confirmer')
            .setStyle(ButtonStyle.Success)

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setEmoji('<:disagree:1200004597213827122>')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Danger)

        const modifyButton = new ButtonBuilder()
            .setCustomId('modify')
            .setEmoji('🛠️')
            .setLabel('Modifier')
            .setStyle(ButtonStyle.Secondary)

        const boutons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                confirmButton, cancelButton, modifyButton
            );

        let embed = new EmbedBuilder()
            .setTitle(`${member.user.username} organise une partie sur LoL !`)
            .setColor(bot.displayHexColor)
            .addFields(fields)
            .setFooter({ text: `${member.user.id}` })

        // switch (mode) {
        //     case modes.FLEX:
        //         break
        //     case modes.CLASH:
        //         break
        //     case modes.CUSTOM:
        //         break
        //     case modes.ARENA:
        //         break
        //     default:
        //         return await interaction.reply({ content: "Mode de jeu invalide", ephemeral: true })
        // }

        return interaction.reply({ content: `Confirmation ${(date ? "le" : "à") + time(dateEvent, lettre)} en ${mode} ? (${time(dateEvent, dateFormats.R)})`, embeds: [embed], components: [boutons] })
    }
}
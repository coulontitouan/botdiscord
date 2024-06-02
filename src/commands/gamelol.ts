import { ChatInputCommandInteraction, Guild, GuildMember, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandBuilder, time, channelMention, EmbedBuilder, userMention, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';

module.exports = {
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
                    { name: 'Flex', value: 'Flex' },
                    { name: 'Clash', value: 'Clash' },
                    { name: 'Personnalisée', value: 'Personnalisée' },
                    { name: 'Arena', value: 'Arena' },
                )
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName("ping")
                .setDescription("Ping le rôle LoL ?")
                .setRequired(false)
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
            )
            .addChannelOption(option => option
                .setName("salon")
                .setDescription("Salon du rendez-vous")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildVoice)
            )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const guild = interaction.guild as Guild;

        // Vérifie si le serveur est le bon
        if (member.guild.id !== "1017742904753655828") {
            return await interaction.reply({ content: "Mauvais serveur", ephemeral: true });
        }

        const mode = interaction.options.getString("type", true);
        const ping = interaction.options.getBoolean("ping", false);
        const salon = interaction.options.getChannel("salon", false);
        const date = interaction.options.getString("date", false);
        const heure_minute = interaction.options.getString("heure", false);
        const now = new Date();

        let dateEvent, lettre;
        if (date || heure_minute) {
            const regexRelatifDate = /^((apr[eèé]s[-\s]?)?demain|we|(week([-\s]?)end)|(\+\d+))$/;
            const regexRelatifHeure = /[\+\-][\d+]/
            const regexDate = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])(?:\/\d{4})?$/;
            const regexHeure = /^(2[0-3]|(1|0?)\d)(h([0-5]\d)?|[:\s][0-5]\d)?$/;
            let [jour, mois, annee, heure, minute]: number[] = [];
            let rel = false;
            function getIntoNumber(parts: (string | number)[]) {
                return parts.map(param => parseInt(param.toString()));
            }

            if (date) {
                if (regexDate.test(date)) {
                    [jour, mois, annee] = getIntoNumber(date.length > 5 ? date.split('/') : [...date.split('/'), now.getFullYear()]);
                } else if (regexRelatifDate.test(date)) {
                    rel = true;
                    if (date.includes("demain")) {
                        jour = now.getDate() + 1;
                        if (date.startsWith("apr")) {
                            jour += 1;
                        }
                    } else if (date.includes("we") || date.includes("week")) {
                        jour = now.getDate() + (6 - now.getDay());
                    } else if (date.includes("+")) {
                        jour = now.getDate() + parseInt(date.substring(1));
                    }
                } else {
                    await interaction.reply({ content: "Format de date invalide", ephemeral: true })
                    return
                }
            }
            if (heure_minute) {
                if (regexHeure.test(heure_minute)) {
                    [heure, minute] = getIntoNumber(heure_minute.split('h'));;
                    if (heure < now.getHours() || (heure == now.getHours() && minute < now.getMinutes())) {
                        jour = now.getDate() + 1;
                    }
                } else if (regexRelatifHeure.test(heure_minute)) {
                    if (heure_minute.startsWith("+")) {
                        heure = now.getHours() + parseInt(heure_minute.substring(1));
                        minute = now.getMinutes();
                    }
                    else {
                        heure = now.getHours() - parseInt(heure_minute.substring(1));
                    }
                } else {
                    return await interaction.reply({ content: "Format d'heure invalide", ephemeral: true })
                }
            } else {
                if (rel) {
                    heure = now.getHours();
                    minute = now.getMinutes();
                }
            }

            if (heure_minute) {
                lettre = "t";
                if (date) {
                    lettre = "F";
                }
            } else if (date) {
                lettre = "D";
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
        date || heure_minute ? fields.push({ name: " - Date et heure :", value: time(dateEvent, "F") }) : {}
        salon ? fields.push({ name: " - Salon :", value: `${channelMention(`${salon.id}`)}` }) : {}
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
            .setFooter({ text: `${ping ? true : false} - ${member.user.id}` })

        switch (mode) {
            case "flex":
                break
        }

        return interaction.reply({ content: `Confirmation ${date ? "le" : "à"} ${time(dateEvent, lettre)} en ${mode} ${salon ? `dans le salon ${salon}` : ""} ? (${time(dateEvent, "R")})`, embeds: [embed], components: [boutons] })
    }
}
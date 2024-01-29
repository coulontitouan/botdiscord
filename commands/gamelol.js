const { SlashCommandBuilder, time, channelMention, roleMention, EmbedBuilder, userMention, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, spoiler } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("game")
        .setDescription("undefined")
        .addSubcommand(subcommand =>
            subcommand
                .setName("lol")
                .setDescription("Organise une partie sur LoL.")
                .addStringOption(option =>
                    option.setName("type")
                        .setDescription("Type de partie")
                        .addChoices(
                            { name: 'Flex', value: 'Flex' },
                            { name: 'Clash', value: 'Clash' },
                            { name: 'Personnalisée', value: 'Personnalisée' },
                            { name: 'Arena', value: 'Arena' },
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName("ping")
                        .setDescription("Ping le rôle LoL ?")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName("heure")
                        .setDescription("Heure de la partie (format : 00h00 ou 00h)")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName("date")
                        .setDescription("Date de la partie (format : jj/mm/aaaa)")
                        .setRequired(false)
                )
                .addChannelOption(option =>
                    option
                        .setName("salon")
                        .setDescription("Salon du rendez-vous")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildVoice)
                )
        ),

    async execute(interaction) {

        // Vérifie si le serveur est le bon
        if (interaction.member.guild.id != "1017742904753655828") {
            await interaction.reply({ content: "Mauvais serveur", ephemeral: true })
            return
        }

        const mode = interaction.options.getString("type")
        const ping = interaction.options.getBoolean("ping")
        const salon = interaction.options.getChannel("salon")
        const date = interaction.options.getString("date")
        const heure_minute = interaction.options.getString("heure")
        const now = new Date();

        let dateEvent, lettre;
        if (date || heure_minute) {
            const regexRelatifDate = /^((apr[eèé]s[-\s]?)?demain|we|(week([-\s]?)end)|(\+\d+))$/;
            const regexRelatifHeure = /[\+\-][\d+]/
            const regexDate = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])(?:\/\d{4})?$/;
            const regexHeure = /^(2[0-3]|(1|0?)\d)(h([0-5]\d)?|[:\s][0-5]\d)?$/;
            let jour, mois, annee, heure, minute;
            let rel = false;
            if (date) {
                if (regexDate.test(date)) {
                    [jour, mois, annee] = date.length > 5 ? date.split('/') : [...date.split('/'), now.getFullYear()];
                } else if (regexRelatifDate.test(date)) {
                    rel = true;
                    if (date.includes("demain")) {
                        jour = now.getDate() + 1;
                        if (date.startsWith("apr")) {
                            jour += 1;
                        }
                    }else if (date.includes("we") || date.includes("week")) {
                        jour = now.getDate() + (6 - now.getDay());
                    }else if (date.includes("+")) {
                        jour = now.getDate() + parseInt(date.substring(1));
                    }
                } else {
                    await interaction.reply({ content: "Format de date invalide", ephemeral: true })
                    return
                }
            } 
            if (heure_minute) {
                if (regexHeure.test(heure_minute)) {
                    [heure, minute] = heure_minute.split('h');
                    if (heure < now.getHours() || (heure == now.getHours() && minute < now.getMinutes())) {
                        jour = now.getDate() + 1;
                    }
                } else if(regexRelatifHeure.test(heure_minute)){
                    if (heure_minute.startsWith("+")) {
                        heure = now.getHours() + parseInt(heure_minute.substring(1));
                        minute = now.getMinutes();
                    }
                    else {
                        heure = now.getHours() - parseInt(heure_minute.substring(1));
                    }
                } else {
                    await interaction.reply({ content: "Format d'heure invalide", ephemeral: true })
                    return
                }
            }else{
                if (rel){
                    heure = now.getHours();
                    minute = now.getMinutes();
                }
            }
            
            if (heure_minute){
                lettre = "t";
                if (date){
                    lettre = "F";
                }
            }else if (date){
                lettre = "D";
            }

            jour = jour ? jour : now.getDate();
            mois = mois ? mois : now.getMonth()+1;
            annee = annee ? annee : now.getFullYear();
            heure = heure ? heure : "00";
            minute = minute ? minute : "00";

            dateEvent = new Date(annee, mois-1, jour, heure, minute);

            if (dateEvent < now){
                await interaction.reply({ content: "Date antérieure à aujourd'hui", ephemeral: true })
                return
            }
        }


        const bot = await interaction.guild.members.fetch(interaction.client.application.id)

        const fields = []
        fields.push({ name: " - Type de partie :", value: mode })
        date || heure_minute ? fields.push({ name: " - Date et heure :", value: time(dateEvent,"F") }) : {}
        salon ? fields.push({ name: " - Salon :", value: `${channelMention(`${salon.id}`)}` }) : {}
        fields.push({ name: " - Inscrits :", value: `${userMention(`${interaction.member.user.id}`)}\n` })

        const boutons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setEmoji('<:agree:1200004575785140254>')
                    .setLabel('Confirmer')
                    .setStyle(ButtonStyle.Success))
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setEmoji('<:disagree:1200004597213827122>')
                    .setLabel('Annuler')
                    .setStyle(ButtonStyle.Danger))
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('modifier')
                    .setEmoji('🛠️')
                    .setLabel('Modifier')
                    .setStyle(ButtonStyle.Secondary))

        let embed = new EmbedBuilder()
            .setTitle(`${interaction.member.user.username} organise une partie sur LoL !`)
            .setColor(bot.displayHexColor)
            .addFields(fields)
            .setFooter({ text: `${ping ? true : false} - ${interaction.member.user.id}` })

        switch (mode) {
            case "flex":
                break
        }

        return interaction.reply({ content: `Confirmation ${date ? "le" : "à"} ${time(dateEvent,lettre)} en ${mode} ${salon ? `dans le salon ${salon}` : ""} ? (${time(dateEvent,"R")})`, embeds: [embed], components: [boutons] })
    }
}
const { Client, GatewayIntentBits, Events, Partials, roleMention, userMention, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, strikethrough, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, time } = require("discord.js");
const path = require("node:path");
const fs = require("fs");
const remindSchema = require('./schemas/remindSchema.js');
const mongoose = require('mongoose');

const client = new Client({
    partials: [
        Partials.Channel,
    ],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],

});

module.exports = client

setInterval(async () => {
    const data = await remindSchema.find();
    if (data.length == 0) { console.log("bd vide") }
    for (let i of data) {
        if (i.Time <= Date.now()) {
            client.users.fetch(i.User, false).then((user) => {
                let embed = new EmbedBuilder()
                    .setTitle("Rappel")
                    //.setDescription(`Votre rappel pour la partie en ${i.type}, le ${i.date} à ${i.heure} dans le salon ${i.salon}`)
                    //.setTimestamp()
                    .setURL(i.url)
                user.send({embeds: [embed], content:`Votre rappel pour le match ${i.url}`});
            });
            await remindSchema.findByIdAndDelete(i._id);
        }
    }
}, 60000)

client.commands = new Map();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath)//.filter(file => file.endsWith(".js"));

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {
    const buttonSignIn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('inscription')
            .setEmoji('<:lol:1128386682513784853>')
            .setLabel('S\'inscrire')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('desinscription')
            .setEmoji('<:lol:1128386682513784853>')
            .setLabel('Se désinscrire')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('modifier')
            .setEmoji('🛠️')
            .setLabel('Modifier')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('rappel')
            .setEmoji('🔔')
            .setLabel('Rappel')
            .setStyle(ButtonStyle.Secondary)
    );
    const buttonsSettings = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start')
            .setEmoji('▶️')
            .setLabel('Lancer')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setEmoji('🗑️')
            .setLabel('Supprimer')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('setHeure')
            .setEmoji('⏲')
            .setLabel('Changer l\'heure')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('annuler')
            .setEmoji('<:cancel:1200121851024769144>')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Secondary)
    );

    async function verifAuteur(message = interaction.message) {
        try {
            if (!message.embeds[0].footer.text.includes(`${interaction.member.user.id}`)) {
                interaction.reply({ content: "Tu n'es pas l'organisateur de cette partie.", ephemeral: true })
                return false;
            }
        } catch {
            message = await interaction.channel.messages.fetch(message.reference.messageId)
            return verifAuteur(message)
        }
        return true;
    };

    switch (interaction.customId) {
        case 'boutonngr':
            interaction.member.roles.add('1104446622043209738');
            interaction.reply({ content: 'Bienvenue dans la team NGR', ephemeral: true });
            break;
        case 'boutonjuif':
            interaction.member.roles.add('1061954160557305867');
            interaction.reply({ content: 'T\'es juif maintenant', ephemeral: true })
            break;
        case 'confirm':
            if (! await verifAuteur()) { return }
            let timestamp = interaction.message.content.split('<t:').pop().split(':R>')[0];
            let embed = interaction.message.embeds[0];
            const tempEmbed = new EmbedBuilder(embed).setFooter({ text: `${interaction.member.user.id}-${timestamp}` });
            interaction.message.delete();
            interaction.channel.send({ content: interaction.message.embeds[0].footer.text.includes("true") ? `${roleMention("1123736136246894662")}` : "", embeds: [tempEmbed], components: [buttonSignIn] })
            interaction.reply({ content: interaction.customId == 'confirm' ? "Confirmée !" : "Annulée !", ephemeral: true })
            break
        case 'cancel':
            if (! await verifAuteur()) { return }
            interaction.reply({ content: "Annulée !", ephemeral: true })
        case 'annuler':
            if (! await verifAuteur()) { return }
            interaction.message.delete();
            break
        case 'modifier':
            if (! await verifAuteur()) { return }
            interaction.reply({ components: [buttonsSettings] })
            break
        case 'inscription':
        case 'desinscription':
            const fieldInscrits = interaction.message.embeds[0].fields.length - 1;
            const mentionString = userMention(`${interaction.member.user.id}`);
            const rayeString = strikethrough(`${mentionString}`);
            const estInscrit = interaction.message.embeds[0].fields[fieldInscrits].value.includes(mentionString);
            const estRaye = interaction.message.embeds[0].fields[fieldInscrits].value.includes(rayeString);

            let oldEmbed = interaction.message.embeds[0];

            let condition1 = interaction.customId == 'inscription';

            if (!(condition1 ^ (estInscrit && !(estRaye)))) {
                interaction.reply({ content: `Tu ${condition1 ? 'es déja' : 'n\'es pas'} inscrit.`, ephemeral: true })
                return;
            }
            let newValue = condition1 ? // Si on s'inscrit
                oldEmbed.fields[fieldInscrits].value.includes(rayeString) ? // Si on est déja inscrit
                    oldEmbed.fields[fieldInscrits].value.replace(rayeString, mentionString) : // On deraye
                    oldEmbed.fields[fieldInscrits].value + `\n${mentionString}` : // sinon on ajoute
                oldEmbed.fields[fieldInscrits].value.replace(mentionString, rayeString); // si on se desinscrit on raye

            const tempEmbed2 = new EmbedBuilder(oldEmbed)
                .setFields([
                    ...oldEmbed.fields.slice(0, fieldInscrits),
                    { name: " - Inscrits :", value: newValue }
                ]);
            interaction.message.edit({ embeds: [tempEmbed2], components: [buttonSignIn] })
            interaction.reply({ content: `${condition1 ? "I" : "Dési"}nscrit !`, ephemeral: true })
            break;
        case 'rappel':
            const select = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('selectRappel')
                        .setPlaceholder('Séléctionnez un temps')
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel('5 minutes')
                                .setValue('5'),
                            new StringSelectMenuOptionBuilder()
                                .setLabel('15 minutes')
                                .setValue('15'),
                            new StringSelectMenuOptionBuilder()
                                .setLabel('30 minutes')
                                .setValue('30'),
                            new StringSelectMenuOptionBuilder()
                                .setLabel('1 heure')
                                .setValue('60'),
                        )
                );
            interaction.reply({ content: "Sélectionnez le temps avant la partie pour le rappel :", ephemeral: true, components: [select] });
            break;
        case 'selectRappel':
            let referenceMessage = (await interaction.message.channel.messages.fetch(interaction.message.reference.messageId))
            let date = referenceMessage.embeds[0].footer.text.split('-')[1] - (60 * parseInt(interaction.values[0]));
            console.log(`${interaction.member.user.id} - ${new Date(date * 1000)} - ${referenceMessage.url}`)
            await remindSchema.create({
                User: `${interaction.member.user.id}`,
                Time: new Date(date * 1000),
                url: referenceMessage.url,
            })
            interaction.update({ content: `Vous recevrez un message <t:${date}:R>`, ephemeral: true, components: [] });
            break;

    }
})

client.login(process.env.TOKEN);
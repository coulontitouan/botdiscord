import axios from 'axios';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('spotify')
        .setDescription('Permet d\obtenir le fichier mp3 d\'une musique sur spotify')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('L\'id de la musique spotify (https://spotify.com/track/ID)')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const id = interaction.options.getString('id', true);
        const tokenSpotify = await axios.post(
            "https://accounts.spotify.com/api/token",
            "grant_type=client_credentials",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: "2095f8c74b8144d596991bd6f3759202",
                    password: "8b37685e2e0f4489ab93423400211b2f",
                },
            }
        ).then((response) => response.data.access_token);

        const track = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
            headers: { Authorization: `Bearer ${tokenSpotify}` },
        }).then((response) => response.data);

        console.log(track);

        const embed = new EmbedBuilder()
            .setTitle(track.name)
            .setDescription(track.artists.map((item: { name: string }) => item.name).join("·"))
            .setThumbnail(track.album.images[0].url)
        interaction.reply({ embeds: [embed] });
    },
};
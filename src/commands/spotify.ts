import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk';
import ytSearch from "youtube-sr";
import ytdl from "ytdl-core";
import { PassThrough } from "stream";

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
        const api = SpotifyApi.withClientCredentials(
            "2095f8c74b8144d596991bd6f3759202",
            "8b37685e2e0f4489ab93423400211b2f"
        );

        const track = await api.tracks.get(id, 'FR').catch(() => {
            interaction.reply({ content: "La musique n'a pas été trouvée", ephemeral: true });
            return null;
        });

        if (!track) return;

        const query = `${track.name} by ${track.artists[0].name} official`;

        const videos = await ytSearch.default.search(query, { limit: 5, type: "video" });

        let closestDuration = null;
        let closestVideoUrl = null;

        for (const video of videos) {
            if (video.duration === track.duration_ms) {
                return video.id;
            }

            if (
                !closestDuration ||
                Math.abs(video.duration - track.duration_ms) <
                Math.abs(closestDuration - track.duration_ms)
            ) {
                closestDuration = video.duration;
                closestVideoUrl = video.id;
            }
        }

        const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);

        // Choose the highest quality audio format
        const audioFormat = ytdl.chooseFormat(info.formats, {
          quality: "highestaudio",
        });
    
        // Get audio stream and process it
        const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
        const buffer = new Promise((resolve, reject) => {
            const mp3Buffer = [];
            const outputStream = new PassThrough();
            outputStream.on("error", (err) => {
              reject(err);
            });
            outputStream.on("end", () => {
              const finalBuffer = Buffer.concat(mp3Buffer);
              resolve(finalBuffer);
            });
      
            audioStream.pipe(outputStream);
            outputStream.on("data", (chunk) => {
              mp3Buffer.push(chunk);
            });
      
            outputStream.on("error", (err) => {
              reject(err);
            });
          });

        const embed = new EmbedBuilder()
            .setTitle(track.name)
            .setDescription(track.artists.map((item: { name: string }) => item.name).join("·"))
            .setThumbnail(track.album.images[0].url)
        interaction.reply({ embeds: [embed] });
    },
};
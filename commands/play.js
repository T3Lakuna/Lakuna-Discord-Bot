module.exports = {
	name: "play",
	description: "Plays a song or playlist from YouTube",
	usage: "PLAY (Source) [Bitrate]",
	numRequiredArgs: 1,
	async execute(message, args) {
		const fs = require("fs");
		const ytdl = require("ytdl-core");
		const ytpl = require("ytpl");
		const ytsr = require("ytsr");
		const discord = require("discord.js");

		const YOUTUBE_BASE_URL = "https://www.youtube.com/";
		const VIDEO_BASE_URL = "https://www.youtube.com/watch?v=";

		// Get channel.
		const { channel } = message.member.voice;
		if (!channel) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.INFO_HEX).setTitle("Must be in a voice channel to use this command.")) }

		// Get bitrate.
		let bitrate = 64;
		if (args.length > 1 && /^\d+$/.test(args[args.length - 1])) { bitrate = parseInt(args.pop()); }

		// Get URL.
		const urls = [];
		if (args[0].startsWith(YOUTUBE_BASE_URL)) {
			if (args[0].includes("list=")) { // YouTube playlist.
				const playlistId = (args[0] + "&").match("list=(.*?)&")[1];
				try {
					const playlist = await ytpl(playlistId);
					for (const video of playlist.items) { urls.push(VIDEO_BASE_URL + video.id); }
				} catch (e) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error getting playlist:\n" + e.name + ": " + e.message)); }
			} else { urls.push(args[0]); } // YouTube link.
		} else { // Search query.
			try {
				const searchResults = await ytsr(args.join(" "));
				for (const video of searchResults.items) {
					if (video.type != "video") { continue; }
					urls.push(video.link);
					break;
				}
				if (!urls.length) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.INFO_HEX).setTitle("No search results for \"" + args.join(" ") + "\".")); }
			} catch (e) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error while searching:\n" + e.name + ": " + e.message)); }
		}

		// Add songs to queue.
		const audioQueue = [];
		output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Play (" + urls.length + ")");
		for (url of urls) {
			audioQueue.push({ url: url, bitrate: bitrate });
			output.addField(url, bitrate + "kbps, position " + audioQueue.length, true);
		}
		message.channel.send(output);

		if (audioQueue.length) { play(channel, audioQueue.pop()); }

		function play(channel, query) {
			try {
				message.channel.send(new discord.MessageEmbed().setColor(message.client.SUCCESS_HEX).setTitle("Now playing " + query.url + " at " + query.bitrate + "kbpm."));
				channel.join().then((connection) => {
					connection.on('ready', () => {
						connection.voice.setDeaf(); // Save resources by not listening to audio input.

						const stream = ytdl(query.url, { filter: "audioonly", quality: "lowest" }); // Lowest ytdl quality is default Discord quality.
						const dispatcher = connection.play(stream, { volume: false, bitrate: query.bitrate }); // Disable volume transforms to improve performance.

						dispatcher.on('error', () => message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Dispatcher error:\n" + error.name + ": " + error.message)))
						dispatcher.on("finish", () => {
							if (audioQueue.length) { play(channel, audioQueue.pop()); } else { connection.disconnect(); }
						});
					});

					connection.on('error', error => message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Connection error:\n" + error.name + ": " + error.message)));

					connection.on('failed', error => message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Connection failed:\n" + error.name + ": " + error.message)));
				}).catch((error) => {
					message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle(query.url + " was not found."));
					if (audioQueue.length) { play(channel, audioQueue.pop()); } else {channel.leave(); }
				});
			} catch (error) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error while playing:\n" + error.name + ": " + error.message)); }
		}
	}
}

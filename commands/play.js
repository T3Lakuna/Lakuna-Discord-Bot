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
				} catch { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error getting playlist.")); }
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
			} catch { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error while searching.")); }
		}

		// Add songs to queue.
		const audioQueue = [];
		output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Play (" + urls.length + ")");
		for (url of urls) {
			audioQueue.push({url: url, bitrate: bitrate});
			output.addField(url, bitrate + "kbps, position " + audioQueue.length, true);
		}
		message.channel.send(output);

		let nowPlaying = false;
		if (audioQueue.length) { play(channel, audioQueue.pop()); }

		function play(channel, query) {
			if (nowPlaying) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.INFO_HEX).setTitle("I'm already playing in another channel.")); }

			message.channel.send(new discord.MessageEmbed().setColor(message.client.SUCCESS_HEX).setTitle("Now playing " + query.url + " at " + query.bitrate + "kbpm."));
			channel.join().then((connection) => {
				if (connection.channel.members.size < 2) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.INFO_HEX).setTitle("I was left alone in a voice channel, so I'm disconnecting.")); }
				nowPlaying = true;
				const stream = ytdl(query.url, {
					filter: "audioonly",
					quality: "lowest" // Lowest ytdl quality is default Discord quality.
				});
				const dispatcher = connection.play(stream, {
					volume: false, // Disable volume transforms to improve performance.
					bitrate: query.bitrate
				});
				dispatcher.on("finish", () => {
					nowPlaying = false;
					if (audioQueue.length) { play(channel, audioQueue.pop()); } else { connection.disconnect(); }
				});
			}).catch((error) => {
				nowPlaying = false;
				return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle(query.url + " was not found."));
				if (audioQueue.length) { play(channel, audioQueue.pop()); } else {channel.leave(); }
			});
		}
	}
}

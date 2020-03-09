module.exports = {
	name: "play",
	description: "Plays a song or playlist from YouTube",
	usage: "PLAY (Source) [Bitrate]",
	numRequiredArgs: 1,
	execute(message, args) {
		const fs = require("fs");
		const ytdl = require("ytdl-core");
		const ytpl = require("ytpl");
		const ytsr = require("ytsr");
		const discord = require("discord.js");

		const YOUTUBE_BASE_URL = "https://www.youtube.com/";
		const VIDEO_BASE_URL = YOUTUBE_BASE_URL + "watch?v=";

		// Get channel.
		const { channel } = message.member.voice;
		if (!channel) { return message.channel.send(new discord.MessageEmbed().setColor("#20b2aa").setTitle("Must be in a voice channel to use this command.")) }

		// Get bitrate.
		let bitrate = 64;
		if (args.length > 1 && /^\d+$/.test(args[args.length - 1])) { bitrate = parseInt(args.pop()); }

		// Get URL.
		let url = args[0];
		if (url.startsWith(YOUTUBE_BASE_URL)) {
			if (url.includes("list=")) {
				const playlistId = (url + "&").match("list=(.*?)&")[1];
				ytpl(playlistId, function(err, playlist) {
					if (err) { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Error getting playlist: " + err)); }
					output = new discord.MessageEmbed()
							.setColor("#a4c639")
							.setTitle("Add to Queue (" + playlist.total_items + ")");
					for (const video of playlist.items) {
						addToQueue(VIDEO_BASE_URL + video.id, bitrate);
						output.addField(video.title + "(" + video.duration + ")", video.author.name, true);
					}
					message.channel.send(output);
					if (audioQueue.length) { play(channel, audioQueue.pop()); }
				});
			} else {
				addToQueue(url, bitrate);
				message.channel.send(new discord.MessageEmbed().setColor("#a4c639").setTitle("Added " + url + " to queue."));
				if (audioQueue.length) { play(channel, audioQueue.pop()); }
			}
		} else {
			ytsr(args.join(" "), function(err, searchResults) {
				if (err) { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Error searching YouTube: " + err)); }
				for (const video of searchResults.items) {
					if (video.type != "video") { continue; }
					addToQueue(video.link, bitrate);
					message.channel.send(new discord.MessageEmbed().setColor("#a4c639").setTitle("Added " + video.title + " to queue."));
					if (audioQueue.length) { play(channel, audioQueue.pop()); }
					return;
				}
				return message.channel.send(new discord.MessageEmbed().setColor("#20b2aa").setTitle("No search results for \"" + args.join(" ") + "\"."));
			});
		}

		function addToQueue(url, bitrate) {
			const query = {};
			query.url = url;
			query.bitrate = bitrate;
			audioQueue.push(query);
			// TODO - Make contents of audio queue persist (so that they actually queue).
		}

		function play(channel, query) {
			if (message.client.nowPlaying) { return; } // Don't stop playing if a song is already playing.

			message.channel.send(new discord.MessageEmbed().setColor("#a4c639").setTitle("Now playing " + query.url + " at " + query.bitrate + "kbpm."));
			channel.join().then((connection) => {
				message.client.nowPlaying = true;
				const stream = ytdl(query.url, {
					filter: "audioonly",
					quality: "lowest" // Lowest ytdl quality is default Discord quality.
				});
				const dispatcher = connection.play(stream, {
					volume: false, // Disable volume transforms to improve performance.
					bitrate: query.bitrate
				});
				dispatcher.on("finish", () => {
					message.client.nowPlaying = false;
					if (audioQueue.length) { play(channel, audioQueue.pop()); } else { connection.disconnect(); }
				});
			}).catch((error) => {
				message.client.nowPlaying = false;
				return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle(query.url + " was not found."));
				if (audioQueue.length) { play(channel, audioQueue.pop()); } else {channel.leave(); }
			});
		}
	}
}

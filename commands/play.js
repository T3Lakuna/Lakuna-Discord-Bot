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

		const YOUTUBE_BASE_URL = "https://www.youtube.com/";
		const VIDEO_BASE_URL = YOUTUBE_BASE_URL + "watch?v=";

		// Get channel.
		const { channel } = message.member.voice;
		if (!channel) { return message.channel.send("Must be in a voice channel to use this command."); }

		// Get bitrate.
		let bitrate = 64;
		if (args.length > 1 && /^\d+$/.test(args[args.length - 1])) { bitrate = parseInt(args.pop()); }

		// Get URL.
		let url = args[0];
		if (url.startsWith(YOUTUBE_BASE_URL)) {
			if (url.includes("list=")) {
				const playlistId = (url + "&").match("list=(.*?)&")[1];
				ytpl(playlistId, function(err, playlist) {
					if (err) { return message.channel.send("Error getting playlist:\n" + err); }
					output = "";
					for (const video of playlist.items) {
						addToQueue(VIDEO_BASE_URL + video.id, bitrate);
						output += "\nAdded `" + video.title + "` to play queue.";
					}
					message.channel.send(output);
					if (audioQueue.length) { play(channel, audioQueue.pop()); }
				});
			} else {
				addToQueue(url, bitrate);
				message.channel.send("Added to play queue.");
				if (audioQueue.length) { play(channel, audioQueue.pop()); }
			}
		} else {
			ytsr(args.join(" "), function(err, searchResults) {
				if (err) { message.channel.send("Error searching YouTube:\n" + err); }
				for (const video of searchResults.items) {
					if (video.type != "video") { continue; }
					addToQueue(video.link, bitrate);
					message.channel.send("Added `" + video.title + "` to play queue.");
					if (audioQueue.length) { play(channel, audioQueue.pop()); }
					return;
				}
				return message.channel.send("No search results for \"" + args.join(" ") + "\".");
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

			message.channel.send("Now playing: `" + query.url + "`.");
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
				message.channel.send("The specified track was not found.");
				if (audioQueue.length) { play(channel, audioQueue.pop()); } else {channel.leave(); }
			});
		}
	}
}

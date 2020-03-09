module.exports = {
	name: "play",
	description: "Plays a song from YouTube",
	usage: "PLAY (Query) [Bitrate]",
	numRequiredArgs: 1,
	execute(message, args) {
		const ytdl = require("ytdl-core");
		const ytpl = require("ytpl");
		const ytsr = require("ytsr");
		const { audioQueue } = require("./../index.js");
		const { channel } = message.member.voice;
		const VIDEO_BASE_URL = "https://www.youtube.com/watch?v=";

		if (!channel) { return message.channel.send("Must be in a voice channel to use this command."); }

		// Get URL.
		let url = args[0];
		console.log(url);
		if (url.startsWith("https://www.youtube.com/") && url.includes("list=")) {
			const playlistId = (url + "&").match("list=(.*)\\&");
			message.channel.send("Playlist ID: " + playlistId);
		}

		// Get bitrate.
		// let bitrate = 64;
		// if (args.length > 1 && /^\d+$/.test(args[args.length - 1])) { bitrate = parseInt(args[args.length - 1]); }

		// Add to queue.
		// const query = {};
		// query.url = url;
		// query.bitrate = bitrate;
		// audioQueue.push(query);

		// Play in current channel.
		// TODO

		function play(channel, url, bitrate) {
			channel.join().then((connection) => {
				const stream = ytdl(url, {
					filter: "audioonly",
					quality: "lowest" // Lowest ytdl quality is default Discord quality.
				});
				const dispatcher = connection.play(stream, {
					volume: false, // Disable volume transforms to improve performance.
					bitrate: bitrate
				});
				dispatcher.on("end", () => { connection.disconnect(); }); // TODO - Play next track if more exist in queue.
			}).catch((error) => {
				message.channel.send("The specified track was not found.");
				channel.leave(); // TODO - Play next track if more exist in queue.
			});
		}
	}
}

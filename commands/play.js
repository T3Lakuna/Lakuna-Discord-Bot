module.exports = {
	name: "play",
	description: "Plays a song from a source",
	usage: "PLAY (Source) [Bitrate]",
	numRequiredArgs: 1,
	execute(message, args) {
		const ytdl = require("ytdl-core");

		const { channel } = message.member.voice;
		if (!channel) { return message.channel.send("Must be in a voice channel to use this command."); }

		const url = args[0];
		let bitrate = 64;
		if (args.length > 1 && /^\d+$/.test(args[1])) { bitrate = parseInt(args[1]); }

		channel.join().then((connection) => {
			const stream = ytdl(url, {
				filter: "audioonly",
				quality: "lowest" // Lowest ytdl quality is default Discord quality.
			});
			const dispatcher = connection.play(stream, {
				volume: false, // Disable volume transforms to improve performance.
				bitrate: bitrate // Discord default. Discord.js default is 96.
			});
			dispatcher.on("end", () => { connection.disconnect(); });
		}).catch((error) => {
			message.channel.send("The specified track was not found.");
			channel.leave();
		});
	}
}

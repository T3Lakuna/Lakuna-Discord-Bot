module.exports = {
	name: "play",
	description: "Plays a song from a source",
	usage: "PLAY (Source)",
	numRequiredArgs: 1,
	execute(message, args) {
		const ytdl = require("ytdl-core");

		const { channel } = message.member.voice;
		if (!channel) { return message.channel.send("Must be in a voice channel to use this command."); }

		channel.join().then((connection) => {
			const stream = ytdl(args[0], { filter: 'audioonly' });
			const dispatcher = connection.play(stream);
			dispatcher.on("end", () => { channel.leave(); });
		}).catch((error) => {
			message.channel.send("Error while attempting to play audio:\n" + error);
			channel.leave();
		});
	}
}

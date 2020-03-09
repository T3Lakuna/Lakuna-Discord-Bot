module.exports = {
	name: "stop",
	description: "Stops playing music and empties the queue",
	usage: "STOP",
	execute(message, args) {
		message.client.nowPlaying = false;
		audioQueue = [];
		// TODO - Force-leave active channel.
	}
}

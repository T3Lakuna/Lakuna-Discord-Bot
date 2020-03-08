const main = require("./../index.js");

module.exports = {
	name: "ping",
	description: "Ping the server",
	usage: "PING",
	execute(message, args) {
		message.channel.send("Pong (" + main.client.ping + "ms).");
	}
}

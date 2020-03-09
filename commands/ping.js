module.exports = {
	name: "ping",
	description: "Ping the server",
	usage: "PING",
	execute(message, args) { return message.channel.send("Pong."); }
}

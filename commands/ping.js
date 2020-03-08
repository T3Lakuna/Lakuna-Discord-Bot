module.exports = {
	name: "ping",
	description: "Ping the server",
	usage: "PING",
	execute(message, args) { message.channel.send("Pong."); }
}

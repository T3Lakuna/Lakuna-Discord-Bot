const fs = require("fs");
const discord = require("discord.js");
const dotenv = require("dotenv");

dotenv.config(); // Get environment variables when running on desktop.

const PREFIX = "~";

// Create client.
const client = new discord.Client();

// Create queue for audio.
const audioQueue = [];

// Setup commands.
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"))
for (const file of commandFiles) {
	const command = require("./commands/" + file);
	client.commands.set(command.name, command);
}

client.on("ready", () => { console.log("Lakuna started at " + new Date().toISOString()); });

// React to commands.
client.on("message", (message) => {
	if (message.author.bot) { return; }
	if (!message.content.startsWith(PREFIX)) { return; }

	const args = message.content.slice(PREFIX.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (!/(~|\\*|`|_).*/.test(commandName)) { return; } // Prevent markdown from registering as commands.
	if (!client.commands.has(commandName)) { return message.channel.send("Unknown command \"" + commandName + "\"."); }

	const command = client.commands.get(commandName);

	if (command.numRequiredArgs && args.length < command.numRequiredArgs) {
		if (command.usage) { return message.channel.send("`Usage: " + command.usage + "`."); } else { return message.channel.send("Missing required arguments."); }
	}

	command.execute(message, args);
});

// Login.
client.login(process.env.TOKEN);

// Exports for commands to read.
module.exports = {
	client: client,
	audioQueue: audioQueue
}

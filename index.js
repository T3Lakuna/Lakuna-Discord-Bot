const fs = require("fs");
const discord = require("discord.js");
const dotenv = require("dotenv");

dotenv.config(); // Get environment variables when running on desktop.

const PREFIX = "~";

// Create client.
const client = new discord.Client();

// Create audio queue.
global.audioQueue = [];
client.nowPlaying = false;

// Setup commands.
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"))
for (const file of commandFiles) {
	const command = require("./commands/" + file);
	client.commands.set(command.name, command);
}

// React to commands.
client.on("message", (message) => {
	if (message.author.bot) { return; }
	if (!message.content.startsWith(PREFIX)) { return; }

	const args = message.content.slice(PREFIX.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (!/(~|\\*|`|_).*/.test(commandName)) { return; } // Prevent markdown from registering as commands.
	if (!client.commands.has(commandName)) { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Unknown command \"" + commandName + "\"")); }

	const command = client.commands.get(commandName);

	if (command.numRequiredArgs && args.length < command.numRequiredArgs) { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Usage: " + command.usage)); }

	command.execute(message, args);
});

// Login.
client.login(process.env.TOKEN);

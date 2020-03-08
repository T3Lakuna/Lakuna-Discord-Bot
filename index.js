const fs = require("fs");
const discord = require("discord.js");

const PREFIX = "~";

// Create client.
const client = new discord.Client();

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

	if (commandName.match("(~|\\*|`|_).*")) { return; } // Prevent markdown from registering as commands.
	if (!client.commands.has(commandName)) {
		message.channel.send("Unknown command \"" + commandName + "\'.")
		return;
	}

	const command = client.commands.get(commandName);

	if (command.numRequiredArgs && args.length < command.numRequiredArgs) {
		if (command.usage) { message.channel.send("`Usage: " + command.usage + "`."); } else { message.channel.send("Missing required arguments."); }
		return;
	}

	command.execute(message, args);
});

// Login.
client.login(process.env.TOKEN);

// Exports for commands to read.
module.exports = {
	client: client
}

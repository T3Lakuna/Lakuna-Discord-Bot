const main = require("./../index.js");

module.exports = {
	name: "help",
	description: "Displays helpful information",
	usage: "HELP [Command name]",
	execute(message, args) {
		if (!args.length) {
			let output = "List of commands:\n```\nLITERAL (Required) [Optional]\n";
			for (const command of main.client.commands.array()) { output += "\n" + command.usage; }
			message.channel.send(output + "\n```");
			return;
		}

		const command = main.client.commands.get(args[0].toLowerCase());

		if (!command) {
			message.channel.send("Unknown command \"" + args[0] + "\".");
			return;
		}

		let output = "```\nName: " + command.name;
		if (command.description) { output += "\nDescription: " + command.description; }
		if (command.usage) { output += "\nUsage: " + command.usage; }
		message.channel.send(output + "\n```");
	}
}

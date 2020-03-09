module.exports = {
	name: "help",
	description: "Displays helpful information",
	usage: "HELP [Command name]",
	execute(message, args) {
		if (!args.length) {
			let output = "List of commands:\n```\nLITERAL (Required) [Optional]\n";
			for (const command of message.client.commands.array()) { output += "\n" + command.usage; }
			return message.channel.send(output + "\n```");
		}

		const command = message.client.commands.get(args[0].toLowerCase());

		if (!command) { return message.channel.send("Unknown command \"" + args[0] + "\"."); }

		let output = "```\nName: " + command.name;
		if (command.description) { output += "\nDescription: " + command.description; }
		if (command.usage) { output += "\nUsage: " + command.usage; }
		return message.channel.send(output + "\n```");
	}
}

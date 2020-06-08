module.exports = {
	name: "help",
	description: "Displays helpful information",
	usage: "HELP [Command name]",
	execute(message, args) {
		const discord = require("discord.js");

		if (!args.length) {
			const output = new discord.MessageEmbed()
					.setColor(message.client.SUCCESS_HEX)
					.setTitle("List of Commands")
					.setDescription("Key: LITERAL (Required) [Optional]");
			for (const command of message.client.commands.array()) { output.addField(command.usage, command.description, true); }
			return message.channel.send(output);
		}

		const command = message.client.commands.get(args[0].toLowerCase());
		if (!command) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.INFO_HEX).setTitle("Unknown command.")); }

		const output = new discord.MessageEmbed()
					.setColor(message.client.SUCCESS_HEX)
					.setTitle("Command " + command.name)
					.setDescription("Key: LITERAL (Required) [Optional]");
		if (command.description) { output.addField("Description", command.description, true); }
		if (command.usage) { output.addField("Usage", command.usage, true); }
		if (command.numRequiredArgs) { output.addField("Required Arguments", command.numRequiredArgs, true); }
		return message.channel.send(output);
	}
}

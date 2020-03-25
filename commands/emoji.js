module.exports = {
	name: "emoji",
	description: "View information about an emoji",
	usage: "EMOJI (Name)",
	numRequiredArgs: 1,
	execute(message, args) {
		const discord = require("discord.js");

		// Get emoji.
		const emoji = message.client.emojis.cache.find(emoji => emoji.name == args[0]);
		if (!emoji) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error getting emoji.")); }

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Emoji " + emoji.name + " #" + emoji.id)
				.setThumbnail(emoji.url)
				.addField("Created Date", emoji.createdAt.toISOString(), true)
				.addField("Guild", emoji.guild.name, true)
				.addField("Identifier", emoji.identifier, true);
		if (emoji.animated) { output.addField("Animated", emoji.animated, true); }
		if (emoji.available) { output.addField("Available", emoji.available, true); }
		if (emoji.requiresColons) { output.addField("Requires Colons", emoji.requiresColons, true); }
		message.channel.send(output);
	}
}

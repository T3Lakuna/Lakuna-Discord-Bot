module.exports = {
	name: "emoji",
	description: "View information about an emoji",
	usage: "EMOJI (Emoji)",
	numRequiredArgs: 1,
	execute(message, args) {
		const discord = require("discord.js");

		const emoji = message.client.getEmoji(message, args[0]);
		if (!emoji) { return; }

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

module.exports = {
	name: "user",
	description: "View information about a user",
	usage: "USER (Snowflake)",
	numRequiredArgs: 1,
	execute(message, args) {
		const discord = require("discord.js");

		const user = message.client.users.cache.get(args[0]);
		if (!user) { return new discord.MessageEmbed().setColor("#c80815").setTitle("Error getting user."); }

		const output = new discord.MessageEmbed()
				.setColor("#a4c639")
				.setTitle("User " + user.username + " #" + user.id)
				.setThumbnail(user.avatarURL())
				.addField("Created Date", user.createdAt.toISOString(), true)
				.addField("Discriminator", user.discriminator, true)
				.addField("Tag", user.tag, true);
		if (user.bot) { output.addField("Bot", user.bot, true); }
		if (user.lastMessageID) { output.addField("Last Message", user.lastMessageID, true); }
		return message.channel.send(output);
	}
}

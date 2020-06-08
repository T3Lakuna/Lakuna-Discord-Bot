module.exports = {
	name: "user",
	description: "View information about a user",
	usage: "USER [User]",
	execute(message, args) {
		const discord = require("discord.js");

		let user;
		if (args.length) { user = message.client.getUser(message, args[0]); } else { user = message.author; }
		if (!user) { return; }

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
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

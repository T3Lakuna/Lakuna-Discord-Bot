module.exports = {
	name: "user",
	description: "View information about a user",
	usage: "USER [User]",
	execute(message, args) {
		const discord = require("discord.js");

		// Get user.
		let user;
		if (args.length) {
			// Remove @ from query.
			let query;
			if (args[0].startsWith("<@!")) { query = args[0].substring("<@!".length, args[0].length - ">".length); } else { query = args[0]; }

			user = message.client.users.cache.find(user => user.id == query || user.tag == query || user.username == query);
			const member = message.guild.members.cache.find(member => member.displayName == query || member.nickname == query);
			if (member) { user = member.user; }
			if (!user) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error getting user.")); }
		} else { user = message.author; }
		

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

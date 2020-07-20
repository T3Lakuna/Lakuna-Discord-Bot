module.exports = {
	name: "user",
	description: "View information about a user",
	usage: "USER [User]",
	execute(message, args) {
		const discord = require("discord.js");

		let user;
		if (args.length) {
			const query = args.join(" ");
			user = message.client.getUser(message, query); } else { user = message.author; }
		if (!user) { return; }

		const member = message.client.getMember(message, user.id);

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("User " + user.username + " #" + user.id)
				.setThumbnail(user.avatarURL())
				.addField("Created Date", user.createdAt.toISOString(), true)
				.addField("Discriminator", user.discriminator, true)
				.addField("Tag", user.tag, true);
		if (user.bot) { output.addField("Bot", user.bot, true); }
		if (user.lastMessageID) { output.addField("Last Message", user.lastMessageID, true); }
		if (member) {
			if (member.bannable) { output.addField("Bannable", member.bannable, true); }
			if (member.deleted) { output.addField("Deleted", member.deleted, true); }
			if (member.displayColor) { output.addField("Display Color", member.displayColor, true); }
			if (member.displayHexColor) { output.addField("Display Hex Color", member.displayHexColor, true); }
			if (member.displayName) { output.addField("Display Name", member.displayName, true); }
			if (member.guild) { output.addField("Guild", member.guild, true); }
			if (member.joinedAt) { output.addField("Joined Date", member.joinedAt.toISOString(), true); }
			if (member.kickable) { output.addField("Kickable", member.kickable, true); }
			if (member.lastMessageID) { output.addField("Last Message", member.lastMessageChannelID + " - " + member.lastMessageID, true); }
			if (member.manageable) { output.addField("Manageable", member.manageable, true); }
			if (member.nickname) { output.addField("Nickname", member.nickname, true); }
			if (member.premiumSince) { output.addField("Boost Date", member.premiumSince.toISOString(), true); }
		}
		return message.channel.send(output);
	}
}

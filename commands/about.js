module.exports = {
	name: "about",
	description: "View information about this bot",
	usage: "ABOUT",
	execute(message, args) {
		const discord = require("discord.js");

		message.channel.send(new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Lakuna")
				.setURL("https://lakuna.pw/")
				.setAuthor("Travis Martin", "https://lakuna.pw/storage/images/triquetra/newc.png", "https://github.com/T3rrabyte")
				.setDescription("Lakuna is a lightweight Discord bot with a standard set of commands focused on being aesthetically pleasing, lightweight, and non-intrusive.")
				.setThumbnail(message.client.user.avatarURL())
				.addField("Channels", message.client.channels.cache.size, true)
				.addField("Emojis", message.client.emojis.cache.size, true)
				.addField("Guilds", message.client.guilds.cache.size, true)
				.addField("Users", message.client.users.cache.size, true)
				.addField("Last Reconnect", message.client.readyAt.toISOString(), true)
				.addField("Uptime (ms)", message.client.uptime, true)
				.addField("ID", message.client.user.id, true)
		);
	}
}

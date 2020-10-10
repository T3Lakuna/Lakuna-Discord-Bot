module.exports = {
	name: "server",
	description: "View information about this server",
	usage: "SERVER",
	execute(message, args) {
		const discord = require("discord.js");

		if (!message.guild) {
			return message.channel.send(new discord.MessageEmbed()
					.setColor(message.client.WARNING_HEX)
					.setTitle("Must be in a server to use this command.")
			);
		}

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Server " + message.guild.name + " #" + message.guild.id)
				.addField("Created Date", message.guild.createdAt.toISOString(), true)
				.addField("Content Filter", message.guild.explicitContentFilter, true)
				.addField("Members", message.guild.memberCount, true)
				.addField("Owner", message.guild.owner.user.tag, true)
				.addField("Region", message.guild.region, true);
		if (message.guild.afkChannelID) { output.addField("AFK Channel", message.guild.afkChannelID, true); }
		if (message.guild.afkTimeout) { output.addField("AFK Timeout", message.guild.afkTimeout, true); }
		if (message.guild.applicationID) { output.addField("Application ID", message.guild.applicationID, true); }
		if (message.guild.banner) { output.addField("Banner", message.guild.bannerURL(), true); }
		if (message.guild.channels.cache.size) { output.addField("Channels", message.guild.channels.cache.size, true); }
		if (message.guild.description) { output.setDescription(message.guild.description); }
		if (message.guild.embedChannelID) { output.addField("Embed Channel", message.guild.embedChannelID, true); }
		if (message.guild.emojis.cache.size) { output.addField("Emojis", message.guild.emojis.cache.size, true); }
		if (message.guild.features.length) { output.addField("Features", message.guild.features, true); }
		if (message.guild.icon) { output.setThumbnail(message.guild.iconURL()); }
		if (message.guild.large) { output.addField("Large", message.guild.large, true); }
		if (message.guild.partnered) { output.addField("Partnered", message.guild.partnered, true); }
		if (message.guild.premiumSubscriptionCount) { output.addField("Tier " + message.guild.premiumTier, message.guild.premiumSubscriptionCount + " boosts.", true); }
		if (message.guild.roles.cache.size) { output.addField("Roles", message.guild.roles.cache.size, true); }
		if (message.guild.rulesChannel) { output.addField("Rules Channel", message.guild.rulesChannel.name, true); }
		if (message.guild.splash) { output.addField("Splash", message.guild.splashURL(), true); }
		if (message.guild.systemChannel) { output.addField("System Channel", message.guild.systemChannel.name, true); }
		if (message.guild.vanityURLCode) { output.addField("Vanity URL", message.guild.vanityURLCode, true); }
		if (message.guild.verified) { output.addField("Verified", message.guild.verified, true); }
		if (message.guild.widgetChannel) { output.addField("Widget Channel", message.guild.widgetChannel.name, true); }
		return message.channel.send(output);
	}
}

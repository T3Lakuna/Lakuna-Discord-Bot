module.exports = {
	name: "channel",
	description: "View information about a channel",
	usage: "CHANNEL (Snowflake)",
	numRequiredArgs: 1,
	execute(message, args) {
		const discord = require("discord.js");

		message.client.channels.fetch(args[0]).then((targetChannel) => {
			const output = new discord.MessageEmbed()
					.setColor("#a4c639")
					.setTitle("Channel #" + targetChannel.id)
					.addField("Created Date", targetChannel.createdAt.toISOString(), true)
					.addField("Type", targetChannel.type, true);
			switch(targetChannel.type) {
				case "dm":
					if (targetChannel.lastMessageID) { output.addField("Last Message", targetChannel.lastMessageID, true); }
					if (targetChannel.lastPinAt) { output.addField("Last Pin Date", targetChannel.lastPinAt.toISOString(), true); }
					if (targetChannel.messages.cache.size) { output.addField("Cache Size", targetChannel.messages.cache.size, true); }
					if (targetChannel.partial) { output.addField("Partial", targetChannel.partial, true); }
					output.addField("Recipient", targetChannel.recipient.tag);
					break;
				case "text":
					output.addField("Guild", targetChannel.guild.id, true);
					if (targetChannel.lastMessageID) { output.addField("Last Message", targetChannel.lastMessageID, true); }
					if (targetChannel.lastPinAt) { output.addField("Last Pin Date", targetChannel.lastPinAt.toISOString(), true); }
					if (targetChannel.members.size) { output.addField("Members", targetChannel.members.size, true); }
					output.addField("Name", targetChannel.name, true);
					if (targetChannel.nsfw) { output.addField("NSFW", targetChannel.nsfw, true); }
					if (targetChannel.parentID) { output.addField("Parent", targetChannel.parentID, true); }
					if (targetChannel.topic) { output.addField("Topic", targetChannel.topic, true); }
					break;
				case "voice":
					output.addField("Bitrate", targetChannel.bitrate, true);
					if (targetChannel.full) { output.addField("Full", targetChannel.full, true); }
					output.addField("Guild", targetChannel.guild.id, true);
					if (targetChannel.members.size) { output.addField("Members", targetChannel.members.size, true); }
					output.addField("Name", targetChannel.name, true);
					if (targetChannel.parentID) { output.addField("Parent", targetChannel.parentID, true); }
					if (targetChannel.speakable) { output.addField("Speakable", targetChannel.speakable, true); }
					if (targetChannel.userLimit) { output.addField("User Limit", targetChannel.userLimit, true); }
					break;
				case "category":
					if (targetChannel.children.size) { output.addField("Children", targetChannel.children.size, true); }
					output.addField("Guild", targetChannel.guild.id, true);
					if (targetChannel.members.size) { output.addField("Members", targetChannel.members.size, true); }
					output.addField("Name", targetChannel.name, true);
					if (targetChannel.parentID) { output.addField("Parent", targetChannel.parentID, true); }
					break;
				case "news":
					output.addField("Guild", targetChannel.guild.id, true);
					if (targetChannel.lastMessageID) { output.addField("Last Message", targetChannel.lastMessageID, true); }
					if (targetChannel.lastPinAt) { output.addField("Last Pin Date", targetChannel.lastPinAt.toISOString(), true); }
					if (targetChannel.members.size) { output.addField("Members", targetChannel.members.size, true); }
					output.addField("Name", targetChannel.name, true);
					if (targetChannel.nsfw) { output.addField("NSFW", targetChannel.nsfw, true); }
					if (targetChannel.parentID) { output.addField("Parent", targetChannel.parentID, true); }
					if (targetChannel.rateLimitPerUser) { output.addField("Rate Limit", targetChannel.rateLimitPerUser, true); }
					if (targetChannel.topic) { output.addField("Topic", targetChannel.topic, true); }
					break;
				case "store":
					output.addField("Guild", targetChannel.guild.id, true);
					if (targetChannel.members.size) { output.addField("Members", targetChannel.members.size, true); }
					output.addField("Name", targetChannel.name, true);
					if (targetChannel.nsfw) { output.addField("NSFW", targetChannel.nsfw, true); }
					if (targetChannel.parentID) { output.addField("Parent", targetChannel.parentID, true); }
					break;
				case "unknown":
					break;
				default:
					break;
			}
			message.channel.send(output);
		}).catch((err) => { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Error getting channel.")); });
	}
}

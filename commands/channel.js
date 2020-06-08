module.exports = {
	name: "channel",
	description: "View information about a channel",
	usage: "CHANNEL [Channel]",
	execute(message, args) {
		const discord = require("discord.js");
		
		let channel;
		if (args.length > 0) { channel = message.client.getChannel(message, args[0]); } else { channel = message.channel; }
		if (!channel) { return; }

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Channel #" + channel.id)
				.addField("Created Date", channel.createdAt.toISOString(), true)
				.addField("Type", channel.type, true);
		switch(channel.type) {
			case "dm":
				if (channel.lastMessageID) { output.addField("Last Message", channel.lastMessageID, true); }
				if (channel.lastPinAt) { output.addField("Last Pin Date", channel.lastPinAt.toISOString(), true); }
				if (channel.messages.cache.size) { output.addField("Cache Size", channel.messages.cache.size, true); }
				if (channel.partial) { output.addField("Partial", channel.partial, true); }
				output.addField("Recipient", channel.recipient.tag);
				break;
			case "text":
				output.addField("Guild", channel.guild.id, true);
				if (channel.lastMessageID) { output.addField("Last Message", channel.lastMessageID, true); }
				if (channel.lastPinAt) { output.addField("Last Pin Date", channel.lastPinAt.toISOString(), true); }
				if (channel.members.size) { output.addField("Members", channel.members.size, true); }
				output.addField("Name", channel.name, true);
				if (channel.nsfw) { output.addField("NSFW", channel.nsfw, true); }
				if (channel.parentID) { output.addField("Parent", channel.parentID, true); }
				if (channel.topic) { output.addField("Topic", channel.topic, true); }
				break;
			case "voice":
				output.addField("Bitrate", channel.bitrate, true);
				if (channel.full) { output.addField("Full", channel.full, true); }
				output.addField("Guild", channel.guild.id, true);
				if (channel.members.size) { output.addField("Members", channel.members.size, true); }
				output.addField("Name", channel.name, true);
				if (channel.parentID) { output.addField("Parent", channel.parentID, true); }
				if (channel.speakable) { output.addField("Speakable", channel.speakable, true); }
				if (channel.userLimit) { output.addField("User Limit", channel.userLimit, true); }
				break;
			case "category":
				if (channel.children.size) { output.addField("Children", channel.children.size, true); }
				output.addField("Guild", channel.guild.id, true);
				if (channel.members.size) { output.addField("Members", channel.members.size, true); }
				output.addField("Name", channel.name, true);
				if (channel.parentID) { output.addField("Parent", channel.parentID, true); }
				break;
			case "news":
				output.addField("Guild", channel.guild.id, true);
				if (channel.lastMessageID) { output.addField("Last Message", channel.lastMessageID, true); }
				if (channel.lastPinAt) { output.addField("Last Pin Date", channel.lastPinAt.toISOString(), true); }
				if (channel.members.size) { output.addField("Members", channel.members.size, true); }
				output.addField("Name", channel.name, true);
				if (channel.nsfw) { output.addField("NSFW", channel.nsfw, true); }
				if (channel.parentID) { output.addField("Parent", channel.parentID, true); }
				if (channel.rateLimitPerUser) { output.addField("Rate Limit", channel.rateLimitPerUser, true); }
				if (channel.topic) { output.addField("Topic", channel.topic, true); }
				break;
			case "store":
				output.addField("Guild", channel.guild.id, true);
				if (channel.members.size) { output.addField("Members", channel.members.size, true); }
				output.addField("Name", channel.name, true);
				if (channel.nsfw) { output.addField("NSFW", channel.nsfw, true); }
				if (channel.parentID) { output.addField("Parent", channel.parentID, true); }
				break;
			case "unknown":
				break;
			default:
				break;
		}
		message.channel.send(output);
	}
}

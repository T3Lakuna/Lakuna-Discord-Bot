module.exports = {
	name: "message",
	description: "View information about a message",
	usage: "MESSAGE (Channel) (Message snowflake)",
	numRequiredArgs: 2,
	execute(message, args) {
		const discord = require("discord.js");

		// Get channel.
		const channel = message.client.channels.cache.find(channel => channel.id == args[0] || channel.name == args[0])
		if (!channel) { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error getting channel.")); }

		channel.messages.fetch(args[1]).then((targetMessage) => {
			const output = new discord.MessageEmbed()
					.setColor(message.client.SUCCESS_HEX)
					.setTitle("Message #" + targetMessage.id)
					.setDescription(targetMessage.cleanContent)
					.addField("Sent Date", targetMessage.createdAt.toISOString(), true)
					.addField("Author", targetMessage.author.tag, true)
					.addField("Channel", targetMessage.channel.name, true)
					.addField("URL", targetMessage.url, true);
			if (targetMessage.attachments.size) { output.addField("Attachments", targetMessage.attachments.size, true); }
			if (targetMessage.tts) { output.addField("TTS", targetMessage.tts, true); }
			if (targetMessage.editedAt) { output.addField("Edited Date", targetMessage.editedAt.toISOString(), true); }
			message.channel.send(output);
		}).catch((err) => { return message.channel.send(new discord.MessageEmbed().setColor(message.client.WARNING_HEX).setTitle("Error getting message.")); });
	}
}

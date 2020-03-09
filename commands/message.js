module.exports = {
	name: "message",
	description: "View information about a message",
	usage: "MESSAGE (Channel snowflake) (Message snowflake)",
	numRequiredArgs: 2,
	execute(message, args) {
		const discord = require("discord.js");

		message.client.channels.fetch(args[0]).then((targetChannel) => {
			targetChannel.messages.fetch(args[1]).then((targetMessage) => {
				const output = new discord.MessageEmbed()
						.setColor("#a4c639")
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
			}).catch((err) => { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Error getting message.")); });
		}).catch((err) => { return message.channel.send(new discord.MessageEmbed().setColor("#c80815").setTitle("Error getting channel.")); });
	}
}

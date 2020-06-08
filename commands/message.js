module.exports = {
	name: "message",
	description: "View information about a message",
	usage: "MESSAGE (Message) [Channel]",
	numRequiredArgs: 1,
	execute(message, args) {
		const discord = require("discord.js");

		let channel;
		if (args.length > 1) { channel = message.client.getChannel(message, args[1]); } else { channel = message.channel; }
		if (!channel) { return; }
		
		channel.messages.fetch(args[0])
				.then(targetMessage => {
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
				})
				.catch(error => message.channel.send(new discord.MessageEmbed()
						.setColor(message.client.WARNING_HEX)
						.setTitle(`Error getting message [${args[0]}].`)
				));
	}
}

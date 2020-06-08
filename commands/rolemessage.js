module.exports = {
	name: "rolemessage",
	description: "Creates a message which users can react to to obtain roles",
	usage: "ROLEMESSAGE (Emoji 1) (Role 1) [Emoji 2] [Role 2]...",
	numRequiredArgs: 2,
	execute(message, args) {
		const discord = require("discord.js");

		if (!message.member.permissionsIn(message.channel).has('ADMINISTRATOR')) {
			return message.channel.send(new discord.MessageEmbed()
					.setColor(message.client.WARNING_HEX)
					.setTitle("You must be an administrator to use this command.")
			);
		}

		const pairs = [];
		for (let i = 0; i < args.length - 1; i += 2) {
			const emoji = message.client.getEmoji(message, args[i]);
			const role = message.client.getRole(message, args[i + 1]);
			pairs.push({ emoji: emoji, role: role });
		}

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle(message.client.ROLE_REACTION_TITLE);
		pairs.forEach(pair => output.addField(pair.emoji, pair.role, true));
		message.channel.send(output).then(message => pairs.forEach(pair => message.react(pair.emoji)));
	}
}

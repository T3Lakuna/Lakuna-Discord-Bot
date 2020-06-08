module.exports = {
	name: "prune",
	description: "Bulk-delete messages sent within the last two weeks",
	usage: "PRUNE [Amount]",
	execute(message, args) {
		const discord = require("discord.js");

		if (!message.member.permissionsIn(message.channel).has('MANAGE_MESSAGES')) {
			return message.channel.send(new discord.MessageEmbed()
					.setColor(message.client.WARNING_HEX)
					.setTitle("You must be allowed to manage messages to use this command.")
			);
		}

		let amount = 100;
		if (args.length > 0 && /^\d+$/.test(args[0])) { amount = args[0]; }
		if (amount < 1 || amount > 100) {
			return message.channel.send(new discord.MessageEmbed()
					.setColor(message.client.WARNING_HEX)
					.setTitle(amount + " is outside of the allowed range (1-100).")
			);
		}

		message.channel.messages.fetch({ limit: amount })
				.then(messages => message.channel.bulkDelete(messages)
						.catch(error => message.channel.send(new discord.MessageEmbed()
								.setColor(message.client.WARNING_HEX)
								.setTitle(`Invalid permissions:\n${error}`)
						))
				)
				.catch(error => message.channel.send(new discord.MessageEmbed()
						.setColor(message.client.WARNING_HEX)
						.setTitle(`Error while pruning messages:\n${error}`)
				));
	}
}

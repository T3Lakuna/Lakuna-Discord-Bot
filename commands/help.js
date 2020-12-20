const { MessageEmbed } = require('discord.js');

module.exports = {
	names: ['help'],
	usage: 'HELP [Command Name]',
	description: 'Returns a list of commands.',
	execute: (message, args) => {
		const embed = new MessageEmbed()
			.setColor(message.client.colors.INFO)
			.setTitle('Help')
			.addField('Support Server', message.client.urls.SUPPORT);
		if (args.length) {
			// Specific command.
			const command = message.client.commands.find((command) => command.names.includes(args[0]));
			return message.channel.send(embed
				.setTitle(`Command: ${command.names[0]}`)
				.setDescription(command.description)
				.addField('Aliases', `${command.names}`)
				.addField('Usage', command.usage)
			).catch((error) => console.log);
		}

		// List of commands.
		for (command of message.client.commands.filter((command) => !command.hidden)) { embed.addField(`${command.names}`, command.description, true); }
		return message.channel.send(embed).catch((error) => console.log);
	}
};
const { MessageEmbed } = require('discord.js');

module.exports = {
	names: ['args', 'arguments', 'parameters'],
	usage: 'ARGS [Argument 1] [Argument 2]...',
	description: 'Prints arguments passed to the command.',
	hidden: true,
	execute: (message, args) => {
		const embed = new MessageEmbed()
			.setColor(message.client.colors.INFO)
			.setDescription('Arguments passed to command:')
			.setTitle('Arguments');
		for (let i = 0; i < args.length; i++) { embed.addField(`Argument #${i + 1}`, args[i], true); }
		return message.channel.send(embed).catch((error) => console.error(error));
	}
};
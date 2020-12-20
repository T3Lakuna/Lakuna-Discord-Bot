const { MessageEmbed } = require('discord.js');

module.exports = {
	names: ['ping'],
	usage: 'PING',
	description: 'Checks bot response time.',
	hidden: true,
	execute: (message, args) => {
		return message.channel.send(new MessageEmbed()
			.setColor(message.client.colors.INFO)
			.setTitle('Pong!')
			.addField('Client', `${new Date() - message.createdAt}ms`, true)
			.addField('API', `${Math.round(message.client.ws.ping)}ms`, true)
		).catch((error) => console.log);
	}
};
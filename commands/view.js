const { MessageEmbed } = require('discord.js');

module.exports = {
	names: ['view', 'v'],
	usage: 'VIEW (Type) (Query)',
	description: 'View information about a Discord object.',
	execute: (message, args) => {
		switch (args[0]) {
			case "activity":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Activities are currently unsupported by the view command.')
				);
			case "app":
			case "application":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Applications are currently unsupported by the view command.')
				);
			case "ch":
			case "channel":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Channels are currently unsupported by the view command.')
				);
			case "activity":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Activities are currently unsupported by the view command.')
				);
			case "emote"
			case "emoji":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Emojis are currently unsupported by the view command.')
				);
			case "server":
			case "guild":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Guilds are currently unsupported by the view command.')
				);
			case "activity":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Activities are currently unsupported by the view command.')
				);
			case "integration":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Integrations are currently unsupported by the view command.')
				);
			case "inv":
			case "invite":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Invites are currently unsupported by the view command.')
				);
			case "msg":
			case "message":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Messages are currently unsupported by the view command.')
				);
			case "role":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Roles are currently unsupported by the view command.')
				);
			case "member":
			case "user":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Users are currently unsupported by the view command.')
				);
			case "webhook":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Webhooks are currently unsupported by the view command.')
				);
			default:
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unknown Type')
						.setDescription(`Your query "${args[0]}" is not recognized as a Discord object type.`)
				);
		}
	}
};
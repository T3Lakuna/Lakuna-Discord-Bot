const { MessageEmbed, Emoji } = require('discord.js');

module.exports = {
	names: ['rr', 'role_reactions'],
	usage: 'RR (Emoji 1) (Role 1) [Emoji 2] [Role 2]...',
	description: 'Creates a message which users can react to for roles.',
	execute: (message, args) => {
		if (!message.member.permissionsIn(message.channel).has('ADMINISTRATOR')) {
			return message.channel.send(new MessageEmbed()
				.setColor(message.client.colors.WARNING)
				.setTitle('Insufficient Permissions')
				.setDescription('You must be an administrator to use this command.')
			).catch((error) => log.console);
		}

		const embed = new MessageEmbed()
			.setColor(message.client.colors.INFO)
			.setTitle('Role Reactions')
			.setDescription(
				'React to this message with the following emojis to toggle the listed role.\n' +
				'\n' +
				'Your reaction will automatically be removed when the role is toggled.'
			);

		const reactions = [];
		for (let i = 0; i < args.length - 1; i += 2) {
			const emojiQuery = args[i].startsWith('<:') && args[i].endsWith('>')
				? args[i].substring('<:'.length, args[i].length - '>'.length)
				: args[i];
			const emoji = emojiQuery instanceof Emoji
				? emojiQuery // Unicode emojis.
				: message.client.emojis.cache.find((emoji) =>
					emoji == emojiQuery
					|| emoji.id == emojiQuery
					|| emoji.identifier == emojiQuery
					|| emoji.name == emojiQuery
				);
			if (!emoji) {
				return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.WARNING)
					.setTitle('Emoji Not Found')
					.setDescription(`The specified emoji, \`${emojiQuery}\`, could not be found.`)
				);
			}

			const roleQuery = args[i + 1].startsWith('<@&') && args[i + 1].endsWith('>')
				? args[i + 1].substring('<@&'.length, args[i + 1].length - '>'.length)
				: args[i + 1]
			const role = message.guild.roles.cache.find((role) =>
				role == roleQuery
				|| role.id == roleQuery
				|| role.name == roleQuery
			);
			if (!role) {
				return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.WARNING)
					.setTitle('Role Not Found')
					.setDescription(`The specified role, \`${roleQuery}\`, could not be found.`)
				);
			}

			embed.addField(`${emoji}`, `${role}`, true);
			reactions.push(emoji);
		}

		return message.channel.send(embed)
			.then((message) => reactions.forEach((emoji) => message.react(emoji)))
			.catch((error) => console.error(error));
	}
};
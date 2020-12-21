const { MessageEmbed } = require('discord.js');

const DISCORD_EPOCH = 1420070400000;

const TIMESTAMP_BITS = 42;
const WORKER_BITS = 5;
const PROCESS_BITS = 5;
const INCREMENT_BITS = 12;

const parsedSnowflake = (snowflake) => {
	const original = snowflake;

	// Convert string to BigInt, since snowflakes are 64-bit.
	snowflake = BigInt(snowflake);
	
	// Convert BigInt to binary string.
	let binary = '';
	while (snowflake > 0) {
		binary = (snowflake % 2n) + binary;
		snowflake = snowflake / 2n;
	}
	while (binary.length < TIMESTAMP_BITS + WORKER_BITS + PROCESS_BITS + INCREMENT_BITS) {
		binary = 0 + binary;
	}
	
	// Split string into parts and revert to decimal.
	return {
		full: original,
		timestamp: new Date(parseInt(binary.substring(0, TIMESTAMP_BITS), 2) + DISCORD_EPOCH),
		worker: parseInt(binary.substring(TIMESTAMP_BITS, TIMESTAMP_BITS + WORKER_BITS), 2),
		process: parseInt(binary.substring(TIMESTAMP_BITS + WORKER_BITS, TIMESTAMP_BITS + WORKER_BITS + PROCESS_BITS), 2),
		increment: parseInt(binary.substring(TIMESTAMP_BITS + WORKER_BITS + PROCESS_BITS), 2)
	};
};

const dateToSnowflake = (date) => {
	// Convert date to BigInt to work with 64-bit snowflakes, and subtract the Discord epoch.
	date = BigInt(date.getTime() - DISCORD_EPOCH);
	
	// Convert date to binary, and fill other sections with zeros.
	let output = '';
	while (date > 0) {
		output = (date % 2n) + output;
		date = date / 2n;
	}
	while (output.length < TIMESTAMP_BITS) {
		output = 0 + output;
	}
	for (let i = 0; i < WORKER_BITS + PROCESS_BITS + INCREMENT_BITS; i++) {
		output += '0';
	}
	
	// Convert back to decimal and return a BigInt.
	return `${BigInt(`0b${output}`)}`;
};

module.exports = {
	names: ['view', 'v'],
	usage: 'VIEW [Type] [Query]',
	description: 'View information about a Discord object.',
	execute: (message, args) => {
		if (!args.length) {
			return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.INFO)
					.setTitle('View Types')
					.setDescription('`activity`, `application`, `channel`, `emoji`, `guild`, `integration`, `invite`, `message`, `role`, `user`, `webhook`, `snowflake`, `date`')
			);
		}

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
			case "emote":
			case "emoji":
				const embedify = (emoji) => {
					const embed = new MessageEmbed()
							.setColor(message.client.colors.INFO)
							.setTitle(`Emoji: ${emoji}`)
							.addField('Identifier', emoji.identifier)
							.addField('Name', emoji.name);

					if (emoji.animated) { embed.addField('Animated', emoji.animated, true); }
					if (emoji.id) { embed.addField('ID', emoji.id, true); }
					if (emoji.createdAt) { embed.addField('Created At', emoji.createdAt.toISOString(), true); }
					if (emoji.deleted) { embed.addField('Deleted', emoji.deleted, true); }
					if (emoji.author) { embed.addField('Author', `${emoji.author}`, true); }
					if (emoji.guild) { embed.addField('Guild', `${emoji.guild}`, true); }
					if (emoji.managed) { embed.addField('Managed', `${emoji.managed}`, true); }
					if (emoji.requiresColons) { embed.addField('Requires Colons', emoji.requiresColons, true); }
					if (emoji.url) { embed.setThumbnail(emoji.url); }

					return embed;
				};

				if (args.length > 1) {
					const query = args[1].startsWith('<:') && args[1].endsWith('>') ? args[1].substring('<:'.length, args[1].length - '>'.length) : args[1];
					const emoji = message.client.emojis.cache.find((emoji) =>
						emoji == query
						|| emoji.name == query
						|| emoji.identifier == query
						|| emoji.id == query
					);

					if (emoji) { return message.channel.send(embedify(emoji)); }
				}

				let reactionMessage;
				return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.INFO)
					.setTitle('Emoji not Found')
					.setDescription(`I was unable to find an emoji based on your query "${args[1]}". React to this message with the emoji you would like to view.`)
				)
						.then((newMessage) => {
							reactionMessage = newMessage;
							return reactionMessage.awaitReactions((reaction, user) => user.id == message.author.id, { max: 1, time: 30000 })
						})
						.then((reactions) => {
							if (reactions.size) {
								reactionMessage.delete().catch((error) => console.log);
								return message.channel.send(embedify(reactions.first().emoji));
							}

							return reactionMessage.react('%E2%9D%8C'); // Show that reaction window is up.
						})
						.catch((error) => message.channel.send(new MessageEmbed()
									.setColor(message.client.colors.ERROR)
									.setTitle('Error')
									.setDescription('There was an error getting reactions. Please contact the bot author or report an issue.')
									.addField('Error Message', `${error}`)
									.addField('Support Server', message.client.urls.SUPPORT)
									.addField('Report an Issue', message.client.urls.ISSUE)
						));
			case "server":
			case "guild":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Guilds are currently unsupported by the view command.')
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
			case "snowflake":
				const snowflake = parsedSnowflake(args.length > 1 ? args[1] : message.id);
				return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.INFO)
					.setTitle(`Snowflake: ${snowflake.full}`)
					.addField('Timestamp', snowflake.timestamp)
					.addField('Worker', snowflake.worker, true)
					.addField('Process', snowflake.process, true)
					.addField('Increment', snowflake.increment, true)
					.setFooter(`Discord Epoch: ${DISCORD_EPOCH}`)
				);
			case "date":
				const dateString = args.slice(1).join(' ');
				const date = args.length > 1 ? new Date(dateString) : new Date();
				if (isNaN(date.getTime())) {
					return message.channel.send(new MessageEmbed()
							.setColor(message.client.colors.WARNING)
							.setTitle(`Invalid Date`)
							.setDescription(`"${dateString}" does not properly resolve to a date.`)
					);
				}
				
				return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.INFO)
					.setTitle(`Date: ${date}`)
					.addField('Snowflake', dateToSnowflake(date), true)
					.setFooter(`Discord Epoch: ${DISCORD_EPOCH}`)
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
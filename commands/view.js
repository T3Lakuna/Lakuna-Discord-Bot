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

const getPerson = (message, query) => {
	query = query.startsWith('<@!') && query.endsWith('>') ? query.substring('<@!'.length, query.length - '>'.length) : query;

	const member = message.guild.members.cache.find((member) =>
		member == query
		|| member.displayName == query
		|| member.id == query
		|| member.nickname == query
		|| member.user == query
		|| member.user.id == query
		|| member.user.tag == query
		|| member.user.username == query
	);

	const user = member ? member.user : message.client.users.cache.find((user) =>
		user == query
		|| user.id == query
		|| user.tag == query
		|| user.username == query
	);

	return { member: member, user: user };
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
					.setDescription('`activity`, `application`, `channel`, `emoji`, `guild`, `integration`, `invite`, `message`, `role`, `user`, `webhook`, `snowflake`, `date`, `voice`, `presence`, `roles`')
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
							.addField('Identifier', `${emoji.identifier}`, true)
							.addField('Name', `${emoji.name}`, true)
							.addField('Animated', `${emoji.animated}`, true)
							.addField('Deleted', `${emoji.deleted}`, true)

					if (emoji.createdAt) { embed.addField('Created At', `${emoji.createdAt.toISOString()}`, true); }
					if (emoji.id) { embed.addField('ID', `${emoji.id}`, true); }
					if (emoji.url) { embed.setThumbnail(`${emoji.url}`); }
					if (emoji.author) { embed.addField('Author', `${emoji.author}`, true); }
					if (typeof emoji.available == 'boolean') { embed.addField('Available', `${emoji.available}`, true); }
					if (typeof emoji.deletable == 'boolean') { embed.addField('Deletable', `${emoji.deletable}`, true); }
					if (emoji.guild) { embed.addField('Guild', `${emoji.guild}`, true); }
					if (typeof emoji.managed == 'boolean') { embed.addField('Managed', `${emoji.managed}`, true); }
					if (typeof emoji.requiresColons == 'boolean') { embed.addField('Requires Colons', `${emoji.requiresColons}`, true); }

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
								reactionMessage.delete().catch((error) => console.error(error));
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
				const query = args.length > 1 ? args[1] : message.author.id;
				const person = getPerson(message, query);

				if (!person || !person.member && !person.user) {
					return message.channel.send(new MessageEmbed()
							.setColor(message.client.colors.WARNING)
							.setTitle('User not Found')
							.setDescription(`I was unable to find a user based on your query "${query}". Note that this command uses the bot's cache to function, so the user might have to send a message before you can view them.`)
					);
				}

				const embed = new MessageEmbed()
						.setColor(message.client.colors.INFO)
						.setTitle(person.member ? `Member ${person.member}` : `User ${person.user}`)
						.addField('Bot', `${person.user.bot}`, true)
						.addField('Created At', `${person.user.createdAt}`)
						.addField('ID', `${person.user.id}`, true)
						.addField('Partial', `${person.user.partial}`, true)
						.setThumbnail(person.user.displayAvatarURL({ dynamic: true }));

				if (person.user.discriminator) {
					embed.addField('Discriminator', `${person.user.discriminator}`, true);
				}
				if (person.user.dmChannel) {
					embed.addField('DM Channel', `${person.user.dmChannel}`, true);
				}
				if (person.user.flags && person.user.flags.length) {
					embed.addField('Flags', `${person.user.flags.toArray()}`, true);
				}
				if (person.user.lastMessage) {
					embed.addField('Last Message', `${person.user.lastMessageChannelID}/${person.user.lastMessageID}`, true);
				}
				if (person.user.locale) {
					embed.addField('Locale (ISO 639-1)', `${person.user.locale}`, true);
				}
				if (typeof person.user.system == 'boolean') {
					embed.addField('System Account', `${person.user.system}`, true);
				}
				if (person.user.tag) {
					embed.addField('Tag', `${person.user.tag}`, true);
				}
				if (person.user.username) {
					embed.addField('Username', `${person.user.username}`, true);
				}

				if (person.member) {
					embed
							.addField('Member', `${person.member}`, true)
							.addField('Management', `Bannable: ${person.member.bannable} | Kickable: ${person.member.kickable} | Manageable: ${person.member.manageable}`)
							.addField('Deleted', `${person.member.deleted}`, true)
							.addField('Display Color', `${person.member.displayColor} | ${person.member.displayHexColor}`, true)
							.addField('Permissions', `${Array.from(person.member.permissions)}`);

					if (person.member.displayName) {
						embed.addField('Display Name', `${person.member.displayName}`, true);
					}
					if (person.member.guild) {
						embed.addField('Guild', `${person.member.guild}`, true);
					}
					if (person.member.joinedAt) {
						embed.addField('Joined At', `${person.member.joinedAt.toISOString()}`);
					}
					if (person.member.nickname) {
						embed.addField('Nickname', `${person.member.nickname}`, true);
					}
					if (person.member.premiumSince) {
						embed.addField('Premium Since', `${person.member.premiumSince.toISOString()}`);
					}
				}

				return message.channel.send(embed);
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
					.addField('ISO 8601 Format', date.toISOString(), true)
					.setFooter(`Discord Epoch: ${DISCORD_EPOCH}`)
				);
			case "voice":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('Voice states are currently unsupported by the view command.')
				);
			case "presence":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('User presences are currently unsupported by the view command.')
				);
			case "roles":
				return message.channel.send(new MessageEmbed()
						.setColor(message.client.colors.WARNING)
						.setTitle('Unsupported')
						.setDescription('User roles are currently unsupported by the view command.')
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
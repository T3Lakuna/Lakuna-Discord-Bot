const { Client, MessageEmbed, Emoji } = require('discord.js');
const fs = require('fs');

// Create client.
const client = new Client({
	partials: [ 'GUILD_MEMBER', 'MESSAGE', 'REACTION' ],
	ws: { intents: [ 'GUILDS', 'GUILD_MEMBERS', 'GUILD_INVITES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS' ] }
});

// Constants.
client.PREFIX = '~';
client.colors = { SUCCESS: '#32CD32', WARNING: '#FDEE00', ERROR: '#FF2400', INFO: '#007FFF' };
client.urls = {
	REPO: 'https://bot.lakuna.pw/r/repository',
	ISSUE: 'https://bot.lakuna.pw/r/issue',
	WEBSITE: 'https://bot.lakuna.pw/r/website',
	SUPPORT: 'https://bot.lakuna.pw/r/support'
};

// Invite cache for invite link attribution.
client.cachedInvites = new Map();

// Load commands.
client.commands = [];
fs.readdir('./commands/', (error, fileNames) => {
	if (error) { return console.log(error); }
	for (fileName of fileNames.filter((fileName) => fileName.endsWith('.js'))) { client.commands.push(require(`./commands/${fileName}`)); }
});

// Log errors.
client.on('error', (error) => console.log);
client.on('shardError', (error) => console.log);

client.on('ready', () => {
	console.log('Ready.');

	client.guilds.cache.forEach((guild) => {
		guild.fetchInvites()
			.then((invites) => client.cachedInvites.set(guild.id, invites))
			.catch((error) => console.log);
	});

	client.user.setActivity(`${client.PREFIX}help`);
});

client.on('guildCreate', (guild) => {
	if (!guild.systemChannel) { return; }
	guild.fetchInvites()
		.then((invites) => client.cachedInvites.set(guild.id, invites))
		.catch((error) => console.log);

	guild.systemChannel.send(new MessageEmbed()
		.setColor(client.colors.INFO)
		.setTitle('Hello, world!')
		.setDescription(
			`Thank you for adding me to your server. To get help, use \`${client.PREFIX}help\` or just @ me.\n` +
			'\n' +
			'**Lakuna is developed by Travis Martin and is licensed under the GNU Affero General Public License version 3.0.**'
		)
		.addField('Source Code', client.urls.REPO)
		.addField('Report an Issue', client.urls.ISSUE)
		.addField('Website', client.urls.WEBSITE)
		.addField('Support Server', client.urls.SUPPORT)
	).catch((error) => console.log);
});

client.on('guildMemberAdd', (member) => {
	if (!member.guild.systemChannel) { return; }
	const embed = new MessageEmbed()
		.setColor(client.colors.INFO)
		.setTitle('Member Joined Guild')
		.setDescription(`${member} has joined the guild.`)
		.setThumbnail(member.user.displayAvatarURL());
	const oldInvites = client.cachedInvites.get(member.guild.id);
	member.guild.fetchInvites()
		.then((invites) => {
			client.cachedInvites.set(member.guild.id, invites);
			const newInvites = client.cachedInvites.get(member.guild.id);
			const usedInvite = newInvites.find((invite) => oldInvites.get(invite.code).uses < invite.uses);
			member.guild.systemChannel.send(embed.addField('Invite', usedInvite.code).addField('Inviter', usedInvite.inviter)).catch((error) => console.log);
		})
		.catch((error) => member.guild.systemChannel.send(embed).catch((error) => console.log));
});

client.on('guildMemberRemove', (member) => {
	if (!member.guild.systemChannel) { return; }
	member.guild.systemChannel.send(new MessageEmbed()
		.setColor(client.colors.INFO)
		.setTitle('Member Left Guild')
		.setDescription(`${member} has left the guild.`)
		.setThumbnail(member.user.displayAvatarURL())
	).catch((error) => console.log);
});

client.on('inviteCreate', (invite) => {
	invite.guild.fetchInvites()
		.then((invites) => client.cachedInvites.set(invite.guild.id, invites))
		.catch((error) => console.log);
});

client.on('inviteDelete', (invite) => {
	invite.guild.fetchInvites()
		.then((invites) => client.cachedInvites.set(invite.guild.id, invites))
		.catch((error) => console.log);
});

// Called once message is fetched if it's partial, or right away otherwise.
client.on('messageReactionAdd', (reaction, user) => {
	let embed;

	const onFetchMember = (member) => {
		embed.fields.forEach((field) => {
			const emojiQuery = field.name.startsWith('<:') && field.name.endsWith('>')
				? field.name.substring('<:'.length, field.name.length - '>'.length)
				: field.name;
			const emoji = emojiQuery instanceof Emoji
				? emojiQuery // Unicode emojis.
				: client.emojis.cache.find((emoji) =>
					emoji == emojiQuery
					|| emoji.id == emojiQuery
					|| emoji.identifier == emojiQuery
					|| emoji.name == emojiQuery
				);
			if (!emoji) {
				return user.send(new MessageEmbed()
					.setColor(client.colors.WARNING)
					.setTitle('Emoji Not Found')
					.setDescription(`The specified emoji, \`${emojiQuery}\`, could not be found.`)
				);
			}

			if (emoji != reaction.emoji) { return; }

			const roleQuery = field.value.startsWith('<@&') && field.value.endsWith('>')
				? field.value.substring('<@&'.length, field.value.length - '>'.length)
				: field.value
			const role = reaction.message.guild.roles.cache.find((role) =>
				role == roleQuery
				|| role.id == roleQuery
				|| role.name == roleQuery
			);
			if (!role) {
				return user.send(new MessageEmbed()
					.setColor(client.colors.WARNING)
					.setTitle('Role Not Found')
					.setDescription(`The specified role, \`${roleQuery}\`, could not be found.`)
				);
			}

			if (member.roles.cache.has(role.id)) {
				member.roles.remove(role).catch((error) => console.log);
			} else {
				member.roles.add(role).catch((error) => console.log);
			}
		});
	};

	const onFetchMessage = () => {
		if (reaction.message.author != client.user) { return; }
		if (user.bot) { return; }
		if (!reaction.message.embeds) { return; }

		embed = reaction.message.embeds[0];
		if (embed.title != 'Role Reactions') { return; }

		reaction.users.remove(user);

		const member = reaction.message.guild.members.cache.find((member) => member.user == user);
		if (member.partial) {
			member.fetch()
				.then(() => onFetchMember(member))
				.catch((error) => console.log)
		} else {
			onFetchMember(member);
		}
	}

	if (reaction.message.partial) {
		reaction.message.fetch()
			.then(() => onFetchMessage())
			.catch((error) => console.log);
	} else {
		onFetchMessage();
	}
});

client.on('message', (message) => {
	// Execute a command from the message.
	const execute = () => {
		// Get message parts.
		const argRegex = /[^\s"]+|"([^"]*)"/gi;
		const args = [];
		const argsString = message.content.slice(client.PREFIX.length);
		while (true) {
			const match = argRegex.exec(argsString);
			if (match == null) { break; }
			args.push(match[1] ? match[1] : match[0]);
		}
		const commandName = args.shift().toLowerCase();

		// Ignore command names that don't start with a letter, since they're probably markdown.
		if (!commandName.charAt(0).match(/[a-z]/)) { return; }

		const command = client.commands.find((command) => command.names.includes(commandName));
		if (!command) {
			return message.channel.send(new MessageEmbed()
				.setColor(client.colors.WARNING)
				.setTitle('Unknown Command')
				.setDescription(`Unknown command. Use \`${client.PREFIX}help\` to get a list of commands.`)
			).catch((error) => console.log);
		}

		// Check argument count.
		if (command.usage) {
			const numExpectedArgs = (command.usage.match(/\(/g) || []).length;
			if (numExpectedArgs > args.length) {
				return message.channel.send(new MessageEmbed()
					.setColor(client.colors.WARNING)
					.setTitle('Insufficient Arguments')
					.setDescription('The command you tried to execute requires more arguments.')
					.addField('Expected Arguments', numExpectedArgs)
					.addField('Supplied Arguments', args.length)
				).catch((error) => console.log);
			}
		}

		try {
			command.execute(message, args);
		} catch (error) {
			message.channel.send(new MessageEmbed()
				.setColor(client.colors.ERROR)
				.setTitle('Error')
				.setDescription('There was an error executing that command. Please contact the bot author or report an issue.')
				.addField('Error Message', `${error}`)
				.addField('Support Server', client.urls.SUPPORT)
				.addField('Report an Issue', client.urls.ISSUE)
			).catch((error) => console.log);
		}

		message.delete().catch((error) => console.log);
	}

	if (message.author.bot) { return; }
	if (message.content.startsWith(client.PREFIX)) { execute(); }

	if (message.mentions.has(client.user)) {
		return message.channel.send(new MessageEmbed()
			.setColor(client.colors.INFO)
			.setDescription(`Hello, ${message.author}! Get a list of my commands using \`${client.PREFIX}help\`.`)
			.setTitle('Hello!')
			.addField('Source Code', client.urls.REPO)
			.addField('Report an Issue', client.urls.ISSUE)
			.addField('Website', client.urls.WEBSITE)
			.addField('Support Server', client.urls.SUPPORT)
		).catch((error) => console.log);
	}
});

client.login(process.env.TOKEN);
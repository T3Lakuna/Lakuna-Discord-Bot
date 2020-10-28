// Load libraries.
const discord = require('discord.js');
const fs = require('fs');
const config = require('./config.js');
const log = require(`${config.LIB_PATH}/log.js`);
const commands = require(`${config.LIB_PATH}/commands.js`);
const memory = require(`${config.LIB_PATH}/memory.js`);
const invite = require(`${config.LIB_PATH}/invite.js`);

// Create client.
const client = new discord.Client({
	partials: [ 'MESSAGE', 'REACTION' ],
	ws: { intents: [
		'GUILDS', // GUILD_CREATE, CHANNEL_CREATE, CHANNEL_DELETE, CHANNEL_PINS_UPDATE
		'GUILD_MEMBERS', // GUILD_MEMBER_ADD, GUILD_MEMBER_REMOVE
		'GUILD_INVITES', // INVITE_CREATE, INVITE_DELETE
		'GUILD_MESSAGES', // MESSAGE_CREATE, MESSAGE_DELETE, MESSAGE_DELETE_BULK
		'GUILD_MESSAGE_REACTIONS' // MESSAGE_REACTION_ADD, MESSAGE_REACTION_REMOVE
	] }
});

// Assign client properties.
client.PREFIX = config.PREFIX;

// Log errors to the console.
client.on('error', (error) => log.console('Event error.', error));
client.on('shardError', (error, shardId) => log.console('Event shardError.', `Shard ID #${shardId}`, error));

// Load commands.
commands.cache(client);

client.on('ready', () => {
	// Load memories.
	memory.cache(client);

	// Set activity to help message.
	client.user.setActivity(`${client.PREFIX}${config.HELP_COMMAND_NAME}`);
});

// If there is no memory channel in the current server, try to link it to the new channel.
client.on('channelCreate', (channel) => {
	if (!channel.guild) { return; }
	const guildMemory = client.memory.get(channel.guild.id);
	if (!guildMemory) { return log.unified(log.types.ERROR, channel.guild, 'Guild memory does not exist. Please contact the bot author.', 'Event channelCreate.'); }
	if (!guildMemory.channel) { guildMemory.cache({ postMemoryChannelIntroMessage: data.joined, parts: [memory.parts.CHANNEL, memory.parts.MEMORIES] }); }
});

// Warn the guild if the memory channel is deleted.
client.on('channelDelete', (channel) => {
	if (!channel.guild) { return; }
	const guildMemory = client.memory.get(channel.guild.id);
	if (!guildMemory) { return log.unified(log.types.ERROR, channel.guild, 'Guild memory does not exist. Please contact the bot author.', 'Event channelDelete.'); }
	if (guildMemory.channel == channel) {
		log.guild(log.types.WARNING, channel.guild, 'The memory channel has been deleted. Some features may not work unless another is created.');
		guildMemory.cache({ parts: [memory.parts.CHANNEL, memory.parts.MEMORIES] });
	}
});

// Update memory.
client.on('channelPinsUpdate', (channel, time) => {
	if (!channel.guild) { return; }
	const guildMemory = client.memory.get(channel.guild.id);
	if (!guildMemory) { return log.unified(log.types.ERROR, channel.guild, 'Guild memory does not exist. Please contact the bot author.', 'Event channelPinsUpdate.'); }
	if (guildMemory.channel == channel) { guildMemory.cache({ parts: [memory.parts.MEMORIES] }); }
});

client.on('guildCreate', (guild) => {
	memory.cache(guild, { createMemoryChannel: true, alreadyJoined: false });

	// Greetings message.
	log.guild(log.types.INFO, guild, `Hello, ${guild.name}! Thank you for inviting me to your server. If you ever need help, you can access a list of my commands with \`${client.PREFIX}${config.HELP_COMMAND_NAME}\` or by tagging me.`);
});

// TODO: Add roles based on invite link.
client.on('guildMemberAdd', (member) => {
	const usedInvite = invite.get(member);
});

// Send a message when a user leaves the guild.
client.on('guildMemberRemove', (member) => log.guild(log.types.INFO, member.guild, `${member} has left the guild.`));

// Update invite cache.
client.on('inviteCreate', (invite) => memory.cache(invite.guild, { parts: [memory.parts.INVITES] }));
client.on('inviteDelete', (invite) => memory.cache(invite.guild, { parts: [memory.parts.INVITES] }));

client.on('message', (message) => {
	if (!message.guild) { return; } // Ignore DMs.
	if (memory.checkWarn(message)) { return; } // Message sent in memory.

	commands.parse(message);

	// Respond to mentions.
	if (message.mentions.has(client.user)) { log.channel(log.types.INFO, message.channel, `Hello, ${message.author}! Get a list of my commands using \`${client.PREFIX}${config.HELP_COMMAND_NAME}\`.`); }

	// Update memory if message sent in memory channel.
	const guildMemory = client.memory.get(message.guild.id);
	if (!guildMemory) { return log.unified(log.types.ERROR, message.guild, 'Guild memory does not exist. Please contact the bot author.', 'Event message.'); }
	if (guildMemory.channel == message.channel) { guildMemory.cache({ parts: [memory.parts.MEMORIES] }); }
});

// Log in.
client.login(process.env.TOKEN);

// Load libraries.
const discord = require('discord.js');
const fs = require('fs');
const config = require('./config.js');
const log = require(`${config.LIB_PATH}/log.js`);
const commands = require(`${config.LIB_PATH}/commands.js`);
const guildMemory = require(`${config.LIB_PATH}/guildMemory.js`);

// Create client.
const client = new discord.Client();

// Assign client properties.
client.PREFIX = config.PREFIX;

// Log errors to the console.
client.on('error', (error) => log.console('Client error.', error));
client.on('shardError', (error, shardId) => log.console(`Shard #${shardId} error.`, error));

// Load commands.
commands.cacheCommands(client);

client.on('ready', () => {
	// Load memories.
	guildMemory.cacheMemories(client);

	// Set activity to help message.
	client.user.setActivity(`${client.PREFIX}${config.HELP_COMMAND_NAME}`);
});

// If there is no memory channel in the current server, try to link it to the new channel.
client.on('channelCreate', (channel) => {
	if (channel.guild && !guildMemory.guildData(channel.guild).memoryChannel) {
		guildMemory.cacheMemoryChannel(channel.guild);
	}
});

// Warn the guild if the memory channel is deleted.
client.on('channelDelete', (channel) => {
	if (!channel.guild) { return; }
	const guildData = guildMemory.guildData(channel.guild);

	if (guildData.memoryChannel == channel) {
		log.guild(log.types.WARNING, channel.guild, 'The memory channel has been deleted. Some features may not work unless another is created.');
		guildMemory.cacheMemoryChannel(channel.guild);
	}
});

// TODO: Update memory.
// client.on('channelPinsUpdate', (channel, time) => log.console('Channel pins updated.'));

client.on('guildCreate', (guild) => {
	guildMemory.cacheGuild(guild, true);

	// Greetings message.
	log.guild(log.types.INFO, guild, `Hello, ${guild.name}! Thank you for inviting me to your server. If you ever need help, you can access a list of my commands with \`${client.PREFIX}${config.HELP_COMMAND_NAME}\` or by tagging me.`);
});

// TODO: Invite link attribution.
// TODO: Add roles based on invite link.
// client.on('guildMemberAdd', (member) => log.console('User joined a guild.'));

// TODO: Send a message when members leave a guild.
// client.on('guildMemberRemove', (member) => log.console('User left a guild.'));

// Update invite cache.
client.on('inviteCreate', (invite) => guildMemory.cacheInvites(invite.guild));

// TODO: Respond to mentions?
// TODO: Warn user for talking in memory channel.
client.on('message', (message) => {
	commands.parseCommand(message);
});

// TODO: Meme of the day registration.
// TODO: Reaction role distribution.
// client.on('messageReactionAdd', (reaction, user) => log.console('Reaction added to message.'));

// TODO: Reaction role distribution.
// client.on('messageReactionRemove', (reaction, user) => log.console('Reaction removed from message.'));

// Log in.
client.login(process.env.TOKEN);

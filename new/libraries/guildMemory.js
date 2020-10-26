// Load libraries.
const discord = require('discord.js');
const log = require('./log.js');
const config = require('../config.js');

module.exports = {
	// Get the guild data of a guild.
	guildData: (guild) => {
		if (!guild.client.guildData) { return log.unified(log.types.ERROR, guild, 'Guild data does not exist. Please contact the bot author.'); }

		const guildData = guild.client.guildData.get(guild.id);
		if (!guildData) { return log.unified(log.types.ERROR, guild, 'Guild data for this guild could not be accessed. Please contact the bot author.'); }

		return guildData;
	},

	// Cache guild invites.
	cacheInvites: (guild) => {
		const guildData = module.exports.guildData(guild);

		guild.fetchInvites()
				.then((invites) => guildData.invites = invites)
				.catch((error) => log.guild(log.types.WARNING, guild, `Lakuna was unable to fetch invites for ${guild}. Please make sure that the bot has the \`Manage Server\` permission enabled.`, error));
	},

	// Save or create a memory channel in a guild.
	cacheMemoryChannel: (guild, tryCreate) => {
		const guildData = module.exports.guildData(guild);

		const memoryChannel = guild.channels.cache.find((channel) => channel.name == config.MEMORY_CHANNEL_NAME);
		if (memoryChannel) {
			guildData.memoryChannel = memoryChannel;

			if (tryCreate) { log.guild(log.types.INFO, guild, `Pre-existing channel ${memoryChannel} designated as Lakuna's memory.`); }
		} else if (tryCreate) {
			// Create a memory channel.
			guild.channels.create(config.MEMORY_CHANNEL_NAME)
					.then((channel) => {
						guildData.memoryChannel = channel;
						log.guild(log.types.SUCCESS, guild, `Lakuna created memory channel ${channel}. This is used in some features to store permanent server data in a way that can be easily managed by server admins.`);
						log.channel(log.types.INFO, channel, 'This channel is now designated as Lakuna\'s memory. Any persistent data that Lakuna stores on your server is saved to the pinned messages in this channel. By deleting or unpinning any message, moderators can manipulate Lakuna\'s memories.');
					})
					.catch((error) => log.guild(log.types.WARNING, guild, `Lakuna was unable to create memory channel \`#${config.MEMORY_CHANNEL_NAME}\`. Without a memory channel, certain features will be unavailable. Please make sure that the bot has the \`Manage Channels\` permission enabled.`, error));
		} else { guildData.memoryChannel = null; } // Clear memory channel if it was set before, in case it's been deleted.
	},

	// Load the entries in a memory channel.
	cacheMemory: () => { }, // TODO

	// Setup guild memory.
	cacheGuild: (guild, isNewGuild) => {
		if (!guild.client.guildData) { return log.unified(log.types.ERROR, guild, 'Guild data does not exist. Please contact the bot author.'); }

		guild.client.guildData.set(guild.id, {});
		module.exports.cacheInvites(guild);
		module.exports.cacheMemoryChannel(guild, isNewGuild);
	},

	// Load all guild memories.
	cacheMemories: (client) => {
		client.guildData = new discord.Collection();
		client.guilds.cache.forEach((guild) => module.exports.cacheGuild(guild));
	}
}

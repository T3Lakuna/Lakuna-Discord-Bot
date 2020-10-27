// Load libraries.
const discord = require('discord.js');
const log = require('./log.js');
const config = require('../config.js');

module.exports = {
	// Cache parts enumeration.
	cacheParts: {
		INVITES: 'invites',
		MEMORY_CHANNEL: 'channel',
		MEMORIES: 'memories'
	},

	// Update cache.
	cache: (clientOrGuild, settings) => {
		const cacheGuild = (guild, settings) => {
			const data = { invites: null, joined: settings.alreadyJoined, memory: { channel: null, memories: null } };

			// Invites.
			if (settings.parts.includes(module.exports.cacheParts.INVITES)) {
				guild.fetchInvites()
						.then((invites) => guild.client.guildData.invites = invites)
						.catch((error) => log.guild(log.types.WARNING, guild, `Lakuna was unable to fetch invites for ${guild}. Please make sure that the bot has the \`Manage Server\` permission enabled.`, error));
			}

			// Memory channel.
			const MEMORY_CHANNEL_INTRO_MESSAGE = 'This channel is now designated as Lakuna\'s memory. Any persistent data that Lakuna stores on your server is saved to the pinned messages in this channel. By deleting or unpinning any message, moderators can manipulate Lakuna\'s memories.';
			if (settings.parts.includes(module.exports.cacheParts.MEMORY_CHANNEL)) {
				const memoryChannel = guild.channels.cache.find((channel) => channel.name == config.MEMORY_CHANNEL_NAME);
				if (memoryChannel) {
					data.memory.channel = memoryChannel;
					if (settings.postMemoryChannelIntroMessage) {
						log.guild(log.types.SUCCESS, guild, `Successfully set memory channel to ${memoryChannel}.`);
						log.channel(log.types.INFO, memoryChannel, MEMORY_CHANNEL_INTRO_MESSAGE);
					}
				} else if (settings.createMemoryChannel) {
					// Create a memory channel.
					guild.channels.create(config.MEMORY_CHANNEL_NAME)
							.then((channel) => {
								data.memory.channel = channel;

								log.guild(log.types.SUCCESS, guild, `Lakuna created memory channel ${channel}. This is used in some features to store permanent server data in a way that can be easily managed by server admins.`);
								log.channel(log.types.INFO, channel, MEMORY_CHANNEL_INTRO_MESSAGE); // Automatically post intro message if channel is created.

								guild.client.guildData.get(guild.id).joined = true; // Set after bot initially joins the server, to prevent multiple messages on initial memory channel creation.
							})
							.catch((error) => log.guild(log.types.WARNING, guild, `Lakuna was unable to create memory channel \`#${config.MEMORY_CHANNEL_NAME}\`. Without a memory channel, certain features will be unavailable. Please make sure that the bot has the \`Manage Channels\` permission enabled.`, error));
				}
			}

			// Memories.
			if (settings.parts.includes(module.exports.cacheParts.MEMORIES)) {
				// TODO
			}

			guild.client.guildData.set(guild.id, data);
		};

		// Default settings.
		if (!settings) { settings = { }; }
		if (typeof settings.createMemoryChannel == 'undefined') { settings.createMemoryChannel = false; }
		if (typeof settings.postMemoryChannelIntroMessage == 'undefined') { settings.postMemoryChannelIntroMessage = false; }
		if (typeof settings.alreadyJoined == 'undefined') { settings.alreadyJoined = true; }
		if (!settings.parts) { settings.parts = [ module.exports.cacheParts.INVITES, module.exports.cacheParts.MEMORY_CHANNEL, module.exports.cacheParts.MEMORIES ]; }

		if (clientOrGuild.client) {
			// Argument is a guild.
			if (!clientOrGuild.client.guildData) { clientOrGuild.client.guildData = new discord.Collection(); }
			cacheGuild(clientOrGuild, settings);
		} else {
			// Argument is a client.
			if (!clientOrGuild.guildData) { clientOrGuild.guildData = new discord.Collection(); }
			clientOrGuild.guilds.cache.forEach((guild) => cacheGuild(guild, settings));
		}
	}
};

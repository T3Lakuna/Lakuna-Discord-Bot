// Load libraries.
const discord = require('discord.js');
const log = require('./log.js');
const config = require('../config.js');

module.exports = {
	// Cache parts enumeration.
	parts: {
		INVITES: 'invites',
		CHANNEL: 'channel',
		MEMORIES: 'memories'
	},

	// TODO: Return a promise so that .then can be used (such as in invite.js).
	// Update cache.
	cache: (clientOrGuild, settings) => {
		const cacheGuild = (guild, settings) => {
			const memory = {
				invites: null,
				joined: settings.alreadyJoined,
				channel: null,
				memories: null,
				cache: (settings) => cacheGuild(guild, settings)
			};

			// Invites.
			if (settings.parts.includes(module.exports.parts.INVITES)) {
				guild.fetchInvites()
						.then((invites) => {
							guild.client.memory.get(guild.id).invites = invites;

							log.console('Invites saved.', invites); // TODO: Delete.
						})
						.catch((error) => log.guild(log.types.WARNING, guild, `Lakuna was unable to fetch invites for ${guild}. Please make sure that the bot has the \`Manage Server\` permission enabled.`, error));
			}

			// Memory channel.
			const MEMORY_CHANNEL_INTRO_MESSAGE = 'This channel is now designated as Lakuna\'s memory. Any persistent data that Lakuna stores on your server is saved to the pinned messages in this channel. By deleting or unpinning any message, moderators can manipulate Lakuna\'s memories.';
			if (settings.parts.includes(module.exports.parts.CHANNEL)) {
				const memoryChannel = guild.channels.cache.find((channel) => channel.name == config.MEMORY_CHANNEL_NAME);
				if (memoryChannel) {
					memory.channel = memoryChannel;
					if (settings.postMemoryChannelIntroMessage) {
						log.guild(log.types.SUCCESS, guild, `Successfully set memory channel to ${memoryChannel}.`);
						log.channel(log.types.INFO, memoryChannel, MEMORY_CHANNEL_INTRO_MESSAGE);
					}
				} else if (settings.createMemoryChannel) {
					// Create a memory channel.
					guild.channels.create(config.MEMORY_CHANNEL_NAME)
							.then((channel) => {
								memory.channel = channel;

								log.guild(log.types.SUCCESS, guild, `Lakuna created memory channel ${channel}. This is used in some features to store permanent server data in a way that can be easily managed by server admins.`);
								log.channel(log.types.INFO, channel, MEMORY_CHANNEL_INTRO_MESSAGE); // Automatically post intro message if channel is created.

								guild.client.memory.get(guild.id).joined = true; // Set after bot initially joins the server, to prevent multiple messages on initial memory channel creation.
							})
							.catch((error) => {
								log.guild(log.types.WARNING, guild, `Lakuna was unable to create memory channel \`#${config.MEMORY_CHANNEL_NAME}\`. Without a memory channel, certain features will be unavailable. Please make sure that the bot has the \`Manage Channels\` permission enabled.`, error);

								guild.client.memory.get(guild.id).joined = true; // Set after bot initially joins the server, to prevent multiple messages on initial memory channel creation.
							});
				}
			}

			// Memories.
			if (settings.parts.includes(module.exports.parts.MEMORIES)) { } // TODO

			guild.client.memory.set(guild.id, memory);
		};

		// Default settings.
		if (!settings) { settings = { }; }
		if (typeof settings.createMemoryChannel == 'undefined') { settings.createMemoryChannel = false; }
		if (typeof settings.postMemoryChannelIntroMessage == 'undefined') { settings.postMemoryChannelIntroMessage = false; }
		if (typeof settings.alreadyJoined == 'undefined') { settings.alreadyJoined = true; }
		if (!settings.parts) { settings.parts = [ module.exports.parts.INVITES, module.exports.parts.CHANNEL, module.exports.parts.MEMORIES ]; }

		if (clientOrGuild.client) {
			// Argument is a guild.
			if (!clientOrGuild.client.memory) { clientOrGuild.client.memory = new discord.Collection(); }
			cacheGuild(clientOrGuild, settings);
		} else {
			// Argument is a client.
			if (!clientOrGuild.memory) { clientOrGuild.memory = new discord.Collection(); }
			clientOrGuild.guilds.cache.forEach((guild) => cacheGuild(guild, settings));
		}
	},

	checkWarn: (message) => {
		if (message.client.memory.get(message.guild.id).channel == message.channel && message.author != message.client.user) {
			log.guild(log.types.WARNING, message.guild, `${message.author}, please do not send messages in the memory channel! It is easier for Lakuna to remember your settings if there are less messages.`);
			message.delete().catch((error) => log.guild(log.types.WARNING, message.guild, `Failed to delete message ${message}. Please make sure that the bot has the \`Manage Messages\` permission enabled.`));
			return true; // Had to warn user.
		}

		return false; // Did not have to warn user.
	},

	addEntry: () => { }, // TODO

	getEntry: () => { } // TODO
};

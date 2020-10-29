const discord = require('discord.js');
const fs = require('fs');
const config = require('./config.js');
const log = require(`${config.LIB_DIR}log.js`);

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

// Assign command prefix to client.
client.PREFIX = config.PREFIX;

// Log errors to the console.
client.on('error', (error) => log.console('Event error.', error));
client.on('shardError', (error, shardId) => log.console('Event shardError.', `Shard ID #${shardId}`, error));

// TODO: Cache commands.

client.on('ready', () => {
	// TODO: Load memory.

	client.user.setActivity(`${client.PREFIX}${config.HELP_COMMAND_NAME}`);
});

// TODO: Try to assign memory channel on channel create.

// TODO: Warn guild if memory channel is deleted.

// TODO: Update pins when channel updates.

client.on('guildCreate', (guild) => {
	// TODO: Cache guild to memory when joining a guild.

	log.discord(guild, {
		fields: [
			{ name: 'Website', value: 'https://lakuna.pw' },
			{ name: 'Support Server', value: 'https://lakuna.pw/r/discord' }
		],
		description: 'Thank you for inviting me to your server. If you ever need help, you can access a list of my commands with ' +
				`\`${client.PREFIX}${config.HELP_COMMAND_NAME}\` or by tagging me.`,
		imageURL: client.user.displayAvatarURL(),
		title: `Hello, ${guild}!`
	});
});

// TODO: Add roles based on invite link.

// Send a message when a user leaves the guild.
client.on('guildMemberRemove', (member) => log.discord(member.guild, {
	description: `${member} has left the guild.`,
	imageURL: member.user.displayAvatarURL(),
	title: 'User Left Guild'
}));

// TODO: Update invite cache on invite create and delete.

client.on('message', (message) => {
	if (!message.guild) { return; } // Ignore DMs.

	// TODO: Warn user if message is sent in memory channel and delete message.

	// TODO: Parse commands.

	// Respond to mentions.
	if (message.mentions.has(client.user)) { log.discord(message.channel, {
		fields: [
			{ name: 'Website', value: 'https://lakuna.pw' },
			{ name: 'Support Server', value: 'https://lakuna.pw/r/discord' }
		],
		description: `Hello, ${message.author}! Get a list of my commands using \`${client.PREFIX}${config.HELP_COMMAND_NAME}\`.`,
		title: 'Hello!'
	}); }

	// TODO: Update memory if message is sent to memory channel.
});

// Login to start bot.
client.login(process.env.TOKEN);

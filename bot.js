const discord = require('discord.js');
const fs = require('fs');
const pg = require('pg');
const config = require('./config.js');
const log = require(`${config.LIB_DIR}log.js`);
const cmd = require(`${config.LIB_DIR}cmd.js`);
const invites = require(`${config.LIB_DIR}invites.js`);
const roles = require(`${config.LIB_DIR}roles.js`);

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

// Create SQL pool.
client.pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }
});

// Log errors to the console.
client.on('error', (error) => log.console('Event error.', error));
client.on('shardError', (error, shardId) => log.console('Event shardError.', `Shard ID #${shardId}`, error));
client.pool.on('error', (error, sqlClient) => {
	if (error) { log.console('SQL pool error.', sqlClient, error); }
	pool.end();
});

// Load commands.
cmd.cache(client);

client.on('ready', () => {
	invites.cache(client).catch((error) => log.console(`Shard failed to cache invites.`, error));

	client.user.setActivity(`${config.PREFIX}${config.HELP_COMMAND_NAME}`);
});

client.on('guildCreate', (guild) => {
	// Send a message to newly-joined guilds.
	log.discord(guild, {
		fields: [
			{ name: 'Website', value: 'https://lakuna.pw' },
			{ name: 'Support Server', value: 'https://lakuna.pw/r/discord' }
		],
		description: 'Thank you for inviting me to your server. If you ever need help, you can access a list of my commands with ' +
				`\`${config.PREFIX}${config.HELP_COMMAND_NAME}\` or by tagging me.`,
		thumbnailURL: client.user.displayAvatarURL(),
		title: `Hello, ${guild}!`
	});

	// Cache invites.
	invites.cache(guild); // Missing permissions if failed.
});

// TODO: Add roles based on invite link.
client.on('guildMemberAdd', (member) => {
	invites.findUsed(member.guild)
			.then((usedInv) => {
				log.discord(member.guild.systemChannel, {
					fields: [
						{ name: 'Invite Code', value: usedInv.code }
					],
					description: `${member} has joined the guild.`,
					thumbnailURL: member.user.displayAvatarURL(),
					title: 'User joined guild.'
				});
			})
			.catch((error) => {
				log.discord(member.guild.systemChannel, {
					fields: [
						{ name: 'Invite Code', value: 'Unable to access' }
					],
					description: `${member} has joined the guild.`,
					thumbnailURL: member.user.displayAvatarURL(),
					title: 'User joined guild.'
				});
			}); // Missing permissions.
})

// Send a message when a user leaves the guild.
client.on('guildMemberRemove', (member) => log.discord(member.guild.systemChannel, {
	description: `${member} has left the guild.`,
	thumbnailURL: member.user.displayAvatarURL(),
	title: 'User left guild.'
}));

// Update invite cache on invite create and delete.
client.on('inviteCreate', (invite) => {
	invites.cache(invite.guild);
});
client.on('inviteDelete', (invite) => invites.cache(invite.guild));

// Toggle reaction roles on reaction add.
client.on('messageReactionAdd', (reaction, user) => roles.addFromReaction(reaction, user));

client.on('message', (message) => {
	// Ignore DMs.
	if (!message.guild) { return; }

	// Parse and execute commands.
	cmd.execute(message);

	// Respond to mentions.
	if (message.mentions.has(client.user)) { log.discord(message.channel, {
		fields: [
			{ name: 'Website', value: 'https://lakuna.pw' },
			{ name: 'Support Server', value: 'https://lakuna.pw/r/discord' }
		],
		description: `Hello, ${message.author}! Get a list of my commands using \`${config.PREFIX}${config.HELP_COMMAND_NAME}\`.`,
		title: 'Hello!'
	}); }
});

// Login to start bot.
client.login(process.env.TOKEN);

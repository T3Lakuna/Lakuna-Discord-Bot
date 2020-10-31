const discord = require('discord.js');
const fs = require('fs');
const config = require('./config.js');
const log = require(`${config.LIB_DIR}log.js`);
const cmd = require(`${config.LIB_DIR}cmd.js`);

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

cmd.cache(client);

client.on('ready', () => {
	// TODO: Load invites.

	client.user.setActivity(`${client.PREFIX}${config.HELP_COMMAND_NAME}`);
});

client.on('guildCreate', (guild) => {
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
// TODO: Update invites when a user joins the server.

// Send a message when a user leaves the guild.
client.on('guildMemberRemove', (member) => log.discord(member.guild, {
	description: `${member} has left the guild.`,
	imageURL: member.user.displayAvatarURL(),
	title: 'User Left Guild'
}));

// TODO: Update invite cache on invite create and delete.

// TODO: Toggle reaction roles on reaction add, then remove the new reaction.

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
		description: `Hello, ${message.author}! Get a list of my commands using \`${client.PREFIX}${config.HELP_COMMAND_NAME}\`.`,
		title: 'Hello!'
	}); }
});

// Login to start bot.
client.login(process.env.TOKEN);

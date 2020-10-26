// Load libraries.
const discord = require('discord.js');
const fs = require('fs');
const config = require('./config.js');
const log = require(`${config.LIB_PATH}/log.js`);

// Create client.
const client = new discord.Client();

// Assign client properties.
client.PREFIX = config.PREFIX;
client.commands = new discord.Collection();
client.ownerCommands = new discord.Collection();
client.guildInvites = new discord.Collection();
client.guildMemes = new discord.Collection();

// Load commands from directory.
const loadCommands = (directory) => {
	fs.readdir(directory, (error, files) => {
		if (error) { return log.console(`Failed to load command files from "${directory}".`, error); }

		const commandFiles = files.filter((file) => file.endsWith('.js'));
		for (const commandFile of commandFiles) {
			const command = require(`${directory}/${commandFile}`);

			if (!command.aliases) { log.console(`Command file "${commandFile}" lacks aliases.`); continue; }

			client.commands.set(command.aliases, command);
		}
	});
};

// Load universal commands.
loadCommands(config.COMMANDS_PATH);

// Load owner commands.
loadCommands(config.OWNER_COMMANDS_PATH);

// Log errors to the console.
client.on('error', (error) => log.console(error));

// Cache server invites.
const cacheInvites = (guild) => {
	guild.fetchInvites()
			.then((invites) => client.guildInvites.set(guild.id, invites))
			.catch((error) => log.guild(log.types.WARNING, guild, `Lakuna was unable to fetch invites for ${guild}. Please make sure that the bot has the "Manage Server" permission enabled.`, error));
};

// TODO: Create memory channel.
// TODO: Send greetings message?
client.on('guildCreate', (guild) => {
	cacheInvites(guild);
});

// TODO: Invite link attribution.
// TODO: Add roles based on invite link.
client.on('guildMemberAdd', (member) => log.console('User joined a guild.'));

// TODO: Send a message when members leave a guild.
client.on('guildMemberRemove', (member) => log.console('User left a guild.'));

client.on('inviteCreate', (invite) => cacheInvites(invite.guild));

// TODO: Command parsing.
client.on('message', (message) => {
	// Only check request messages from humans.
	if (message.author.bot) { return; }
	if (!message.content.startsWith(client.PREFIX)) { return; }

	// Parse request string.
	const args = message.content.slice(client.PREFIX.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Ensure that command name is legal.
	if (!commandName.startsWith(/[a-z]/)) { return; }
	if (!client.commands.has(commandName)) { return log.channel(log.types.WARNING, message.channel, `Unknown command "${commandName}".`); }

	// Get command data.
	const command = client.commands.get(commandName);
	if (!command) { return log.unified(log.types.ERROR, message.guild, `Unable to get file for known command "${commandName}".`); }

	// Ensure that there are enough arguments.
	const numExpectedArgs = (command.usage.match(/\(/g) || []).length;
	if (command.usage && numExpectedArgs > args.length) { return log.channel(log.types.WARNING, message.channel, `Not enough arguments passed. Expected ${numExpectedArgs}, supplied ${args.length}.`); }

	// Execute the command.
	const request = { message: message, command: command, args: args };
	command.execute(request);

	// Delete the request message.
	message.delete().catch((error) => log.console(`Failed to delete message ${message}.`));
});

// TODO: Meme of the day registration.
// TODO: Reaction role distribution.
client.on('messageReactionAdd', (reaction, user) => log.console('Reaction added to message.'));

// TODO: Reaction role distribution.
client.on('messageReactionRemove', (reaction, user) => log.console('Reaction removed from message.'));

// TODO: Warn servers that don't have a memory channel.
// TODO: Cache memory channels.
// TODO: Load memory.
client.on('ready', () => {
	client.guilds.cache.forEach((guild) => cacheInvites(guild));

	client.user.setActivity(`${client.PREFIX}${config.HELP_COMMAND_NAME}`);
});

client.on('shardError', (error, shardId) => log.console(`Shard ${shardId} encountered an error.`, error));

// Log in.
client.login(process.env.TOKEN);

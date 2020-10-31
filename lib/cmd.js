const discord = require('discord.js');
const fs = require('fs');
const log = require('./log.js');
const config = require('../config.js');

module.exports = {
	cache: (client) => {
		client.commands = new discord.Collection();

		fs.readdir(config.CMD_DIR)
				.then((files) => {
					const commandFiles = files.filter((file) => file.endsWith('.js'));
					for (const commandFile of commandFiles) {
						const command = require(`${config.CMD_DIR}${commandFile}`);
						if (!command.aliases) { throw new Error(`Command file ${commandFile} has no aliases.`); }
						client.commands.set(command.aliases, command);
					}
				})
				.catch((error) => log.console(`Error reading command files from ${config.CMD_DIR}.`, error));
	},

	// Execute a command from a message.
	execute: (message) => {
		// Preliminary checks.
		if (!message.client.commands) { throw new Error('Client commands not set. Please contact the bot author.'); }
		if (message.author.bot) { return false; } // Don't execute commands from bots.
		if (!message.content.startsWith(message.client.PREFIX)) { return false; } // Don't execute commands from messages that don't start with the command prefix.

		// Get message parts.
		const args = message.content.slice(message.client.PREFIX.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		// Make sure that the message is actually a command.
		if (!commandName.charAt(0).match(/[a-z]/)) { return false; } // Ignore command names that don't start with a letter, since they're probably markdown.
		if (!message.client.commands.some((commandAliases) => commandAliases.includes(commandName))) {
			log.discord(message.channel, {
				color: log.colors.WARNING,
				description: `Unknown command \`${commandName}\`. Use \`${client.PREFIX}${config.HELP_COMMAND_NAME}\` to get a list of commands.`,
				title: 'Unknown Command'
			});
			return false; // Ignore unknown command names.
		}

		// Get command data.
		const command = message.client.commands.first((command) => command.aliases.includes(commandName));
		if (!command) {
			log.unified(message.channel, `Unable to get command for known command \`${commandName}\`.`);
			return false; // Unable to get command.
		}
		if (!command.execute) {
			log.unified(message.channel, `Known command ${command.aliases[0]} lacks an execute method!`);
			return false; // No execute method.
		}

		// Check argument count.
		const numExpectedArgs = (command.usage.match(/\(/g) || []).length;
		if (command.usage && numExpectedArgs > args.length) {
			log.discord(message.channel(`Not enough arguments supplied for command \`${command.aliases[0]}\` (requires ${numExpectedArgs}, supplied ${args.length}).`));
			return false; // Not enough arguments.
		}

		// Execute command.
		const request = { message: message, args: args };
		command.execute(request);

		// Delete the request message if possible.
		message.delete();
	}
};

const discord = require('discord.js');
const fs = require('fs');
const log = require('./log.js');
const config = require('../config.js');

module.exports = {
	// Command categories enumeration.
	categories: {
		UNCATEGORIZED: 'uncategorized', // Default. Displayed when help command is used without a category name.
		OWNER: 'owner', // Hidden, only usable by bot author.
		HIDDEN: 'hidden', // Hidden, usable by anyone.
		AUDIO: 'audio', // Audio commands.
		API: 'api', // Commands related to specific APIs.
		INFO: 'info' // Commands which display Discord information.
	},

	cache: (client) => {
		client.commands = [];

		fs.readdir(config.CMD_DIR, (error, files) =>{
			if (error) {
				log.console(`Error reading command files from ${config.CMD_DIR}.`, error);
				return false; // Failed to cache commands.
			}

			// Load commands from files.
			const commandFiles = files.filter((file) => file.endsWith('.js'));
			for (const commandFile of commandFiles) {
				const command = require(`.${config.CMD_DIR}${commandFile}`);
				if (!command.aliases) { throw new Error(`Command file ${commandFile} has no aliases.`); }
				if (!command.category) { command.category = module.exports.UNCATEGORIZED; }
				client.commands.push(command);
				log.console('Loaded command.', command);
			}
		});
	},

	// Execute a command from a message.
	execute: (message) => {
		// Preliminary checks.
		if (!message.client.commands) { throw new Error('Client commands not set. Please contact the bot author.'); }
		if (message.author.bot) { return false; } // Don't execute commands from bots.
		if (!message.content.startsWith(config.PREFIX)) { return false; } // Don't execute commands from messages that don't start with the command prefix.

		// Get message parts.
		const argRegex = /[^\s"]+|"([^"]*)"/gi;
		const args = [];
		const argsString = message.content.slice(config.PREFIX.length);

		while (true) {
			const match = argRegex.exec(argsString);
			if (match == null) { break; }
			args.push(match[1] ? match[1] : match[0]);
		}
		const commandName = args.shift().toLowerCase();

		// Make sure that the message is actually a command.
		if (!commandName.charAt(0).match(/[a-z]/)) { return false; } // Ignore command names that don't start with a letter, since they're probably markdown.

		if (!message.client.commands.some((command) => command.aliases.includes(commandName))) {
			log.discord(message.channel, {
				color: log.colors.WARNING,
				description: `Unknown command \`${commandName}\`. Use \`${config.PREFIX}${config.HELP_COMMAND_NAME}\` to get a list of commands.`,
				title: 'Unknown Command'
			});
			return false; // Ignore unknown command names.
		}

		// Get command data.
		const command = message.client.commands.find((command) => command.aliases.includes(commandName));
		if (!command) {
			log.unified(message.channel, `Unable to get command for known command \`${commandName}\`.`);
			return false; // Unable to get command.
		}
		if (!command.execute) {
			log.unified(message.channel, `Known command ${command.aliases} lacks an execute method!`, command);
			return false; // No execute method.
		}

		// Check argument count.
		const numExpectedArgs = (command.usage.match(/\(/g) || []).length;
		if (command.usage && numExpectedArgs > args.length) {
			log.discord(message.channel, {
				color: log.colors.WARNING,
				description: `Not enough arguments supplied for command \`${command.aliases[0]}\` (requires ${numExpectedArgs}, supplied ${args.length}).`,
				title: 'Not enough arguments.'
			});
			return false; // Not enough arguments.
		}

		// Ensure that the user may execute the command.
		if (command.category == module.exports.categories.OWNER && message.author.id != config.OWNER_ID) {
			log.discord(message.channel, {
				color: log.colors.WARNING,
				description: 'Only the bot owner may use that command!',
				title: 'Owner Command'
			});
			return false; // Don't allow non-owner users to execute owner commands.
		}

		// Execute command.
		const request = { message: message, args: args };
		command.execute(request);

		// Delete the request message if possible.
		message.delete(); // Don't care if message can't delete.
	}
};

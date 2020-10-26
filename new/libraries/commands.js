// Load libraries.
const discord = require('discord.js');
const fs = require('fs');
const log = require('./log.js');
const config = require('../config.js');

module.exports = {
	// Load commands from directory.
	cacheCommands: (client) => {
		client.commands = new discord.Collection();

		fs.readdir(config.COMMANDS_PATH, (error, files) => {
			if (error) { return log.console(`Failed to load command files from "${config.COMMANDS_PATH}".`, error); }

			const commandFiles = files.filter((file) => file.endsWith('.js'));
			for (const commandFile of commandFiles) {
				const command = require(`${config.COMMANDS_PATH}/${commandFile}`);

				if (!command.aliases) { log.console(`Command file "${commandFile}" lacks aliases.`); continue; }

				client.commands.set(command.aliases, command);
			}
		});
	},

	// Parse and execute a command from a message.
	parseCommand: (message) => {
		// Don't try to parse a command if there are no commands.
		if (!message.client.commands) { return log.channel(log.types.ERROR, message.channel, `Client commands are not set. Contact the bot author.`); }

		// Only check request messages from humans.
		if (message.author.bot) { return; }
		if (!message.content.startsWith(message.client.PREFIX)) { return; }

		// Parse request string.
		const args = message.content.slice(message.client.PREFIX.length).split(/ +/);
		const commandName = args.shift().toLowerCase();

		// Ensure that command name is legal.
		if (!commandName.charAt(0).match(/[a-z]/)) { return; }
		if (!message.client.commands.has(commandName)) { return log.channel(log.types.WARNING, message.channel, `Unknown command "${commandName}".`); }

		// Get command data.
		const command = message.client.commands.get(commandName);
		if (!command) { return log.unified(log.types.ERROR, message.guild, `Unable to get file for known command "${commandName}".`); }

		// Ensure that there are enough arguments.
		const numExpectedArgs = (command.usage.match(/\(/g) || []).length;
		if (command.usage && numExpectedArgs > args.length) { return log.channel(log.types.WARNING, message.channel, `Not enough arguments passed. Expected ${numExpectedArgs}, supplied ${args.length}.`); }

		// Execute the command.
		const request = { message: message, command: command, args: args };
		command.execute(request);

		// Delete the request message.
		message.delete().catch((error) => log.console(`Failed to delete message ${message}.`));
	}
}

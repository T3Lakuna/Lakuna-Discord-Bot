const discord = require('discord.js');
const config = require('../config.js');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);

module.exports = {
	aliases: [config.HELP_COMMAND_NAME],
	usage: 'HELP [Command | Category]',
	description: 'Returns a list of commands.',
	category: cmd.categories.UNCATEGORIZED,
	execute: (request) => {
		const categories = {};
		const commands = [];
		for (const command of request.message.client.commands) {
			if (!(command.category in categories)) { categories[command.category] = []; }
			categories[command.category].push(command);
		}

		if (request.args.length) {
			const command = request.message.client.commands.find((command) => command.aliases.includes(request.args[0]));
			if (command) {
				// Command-specific output.
				return log.discord(request.message.channel, {
					fields: [
						{ name: 'Aliases', value: `${command.aliases}` },
						{ name: 'Usage', value: command.usage },
						{ name: 'Category', value: command.category }
					],
					description: command.description,
					title: `Command help: ${command.aliases[0]}`
				});
			} else {
				const categoryName = Object.getOwnPropertyNames(categories).find((categoryName) => categoryName == request.args[0]);
				if (categoryName) {
					// Category-specific output.
					let output = {
						fields: [],
						description: `Category "${categoryName}" commands:`,
						title: `Category help: ${categoryName}`
					};
					for (const command of categories[categoryName]) {
						output.fields.push({ name: command.aliases[0], value: command.description });
					}
					return log.discord(request.message.channel, output);
				} else {
					// Unknown help query.
					return log.discord(request.message.channel, {
						color: log.colors.WARNING,
						description: `Unknown command or category "${request.args[0]}".`,
						title: 'Help'
					});
				}
			}
		} else {
			// Argument-less output.
			let description = `Also view more commands by searching categories: \`${cmd.categories.UNCATEGORIZED}\``;
			for (const categoryName in categories) {
				if (
						categoryName == cmd.categories.UNCATEGORIZED ||
						categoryName == cmd.categories.HIDDEN ||
						categoryName == cmd.categories.OWNER
				) { continue; }
				description += `, \`${categoryName}\``;
			}
			description += '.\nUncategorized commands:';

			const categoryName = cmd.categories.UNCATEGORIZED;
			let output = {
				fields: [],
				description: description,
				title: `Category help: ${categoryName}`
			};
			for (const command of categories[categoryName]) {
				output.fields.push({ name: command.aliases[0], value: command.description });
			}
			return log.discord(request.message.channel, output);
		}
	}
};

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
		for (const command of request.message.client.commands) {
			if (!(command.category in categories)) { categories[command.category] = []; }
			categories[command.category].push(command);
		}

		// Assign command/category to print.
		let queryCategoryName, queryCommand;
		if (request.args.length) {
			queryCommand = request.message.client.commands.find((command) => command.aliases.includes(request.args[0]));
			if (!queryCommand) { queryCategoryName = Object.getOwnPropertyNames(categories).find((categoryName) => categoryName == request.args[0]); }
		}
		if (!queryCategoryName && !queryCommand) { queryCategoryName = cmd.categories.UNCATEGORIZED; }

		if (queryCommand) {
			return log.discord(request.message.channel, {
				fields: [
					{ name: 'Aliases', value: `${queryCommand.aliases}`, inline: false },
					{ name: 'Usage', value: queryCommand.usage, inline: false },
					{ name: 'Category', value: queryCommand.category, inline: false }
				],
				description: queryCommand.description,
				title: `Command: ${queryCommand.aliases[0]}`
			});
		} else if (queryCategoryName) {
			const output = {
				fields: [],
				description: `This is the help for a category (\`${queryCategoryName}\`). Other commands can be found in the other categories: \`${cmd.categories.UNCATEGORIZED}\``,
				title: `Category: ${queryCategoryName}`
			};
			for (const categoryName in categories) {
				if (
						categoryName == cmd.categories.UNCATEGORIZED ||
						categoryName == cmd.categories.HIDDEN ||
						categoryName == cmd.categories.OWNER
				) { continue; }
				output.description += `, \`${categoryName}\``;
			}
			output.description += `.\n\n\`${queryCategoryName}\` commands:`;
			for (const command of (categories[queryCategoryName])) { output.fields.push({ name: command.aliases[0], value: command.description }); }
			return log.discord(request.message.channel, output); // Success.
		} else {
			log.unified(request.message.channel, 'The help command tried to return an improper value.');
			return false; // Failure.
		}
	}
};

const config = require('../config.js');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);

module.exports = {
	aliases: ['args', 'arguments', 'parameters'],
	usage: 'ARGS',
	description: 'Prints the passed arguments.',
	category: cmd.categories.HIDDEN,
	execute: (request) => {
		const output = {
			fields: [],
			description: 'Arguments passed to command:',
			title: 'Arguments'
		};
		for (let i = 0; i < request.args.length; i++) { output.fields.push({ name: `Argument #${i + 1}`, value: request.args[i] }); }
		log.discord(request.message.channel, output);
		return true; // Success.
	}
};

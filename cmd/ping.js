const config = require('../config.js');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);

module.exports = {
	aliases: ['ping'],
	usage: 'PING',
	description: 'Checks server response time.',
	category: cmd.categories.HIDDEN,
	execute: (request) => {
		log.discord(request.message.channel, {
			fields: [
				{ name: 'Client', value: `${new Date() - request.message.createdAt}ms` },
				{ name: 'API', value: `${Math.round(request.message.client.ws.ping)}ms` }
			],
			title: 'Pong!'
		});
		return true; // Success.
	}
};

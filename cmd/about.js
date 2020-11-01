const config = require('../config.js');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);

module.exports = {
	aliases: ['about', 'info', 'stats'],
	usage: 'ABOUT',
	description: 'View bot information.',
	category: cmd.categories.UNCATEGORIZED,
	execute: (request) => {
		let guildCount;
		request.message.client.shard.fetchClientValues('guilds.cache.size')
				.then((response) => {
					guildCount = response.reduce((a, c) => a + c);
					log.discord(request.message.channel, {
						fields: [
							{ name: 'Guild Count', value: guildCount },
							{ name: 'Ready Time', value: request.message.client.readyAt.toISOString() },
							{ name: 'Shard Count', value: request.message.client.shard.count },
							{ name: 'Uptime', value: `${request.message.client.uptime}ms` },
							{ name: 'User', value: `${request.message.client.user}` }
						],
						author: { name: 'Travis Martin' },
						description: 'Bot information.',
						thumbnailURL: request.message.client.user.displayAvatarURL(),
						title: 'About'
					});
					return true; // Command succeeded.
				})
				.catch((error) => {
					log.unified(request.message.channel, 'Error getting data from shards.', error);
					return false; // Command failed.
				});
	}
};

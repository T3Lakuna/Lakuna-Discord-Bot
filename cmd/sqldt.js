const dotenv = require('dotenv');
const pg = require('pg');
const config = require('../config');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);

module.exports = {
	aliases: ['sqldt', 'sql_drop_tables'],
	usage: 'SQLDT',
	description: 'Drops SQL tables.',
	category: cmd.categories.OWNER,
	execute: (request) => {
		const pool = new pg.Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: { rejectUnauthorized: false }
		});

		pool.on('error', (error, client) => {
			if (error) { log.unified(request.message.channel, 'Pool error.', client, error); }
			pool.end();
		});

		return pool.connect()
				.then((client) => {
					client.query('DROP TABLE Users;')
							.then((response) => log.discord(request.message.channel, { description: 'Dropped users table.' }))
							.catch((error) => log.unified(request.message.channel, 'Error dropping users table.', error))
							.then(() => client.query('DROP TABLE Guilds;'))
							.then((response) => log.discord(request.message.channel, { description: 'Dropped guilds table.' }))
							.catch((error) => log.unified(request.message.channel, 'Error dropping guilds table.', error))
							.then(() => client.query('DROP TABLE Invites;'))
							.then((response) => log.discord(request.message.channel, { description: 'Dropped invites table.' }))
							.catch((error) => log.unified(request.message.channel, 'Error dropping invites table.', error))
							.then(() => client.end());
				})
				.catch((error) => log.unified(request.message.channel, 'Pool connect error.', error))
				.then(() => pool.end());
	}
};

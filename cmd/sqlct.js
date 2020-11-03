const dotenv = require('dotenv');
const pg = require('pg');
const config = require('../config');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);

module.exports = {
	aliases: ['sqlct', 'sql_create_tables'],
	usage: 'SQLCT',
	description: 'Creates SQL tables.',
	category: cmd.categories.OWNER,
	execute: (request) => {
		return request.message.client.pool.connect()
				.then((client) => {
					client.query('CREATE TABLE Users (ID TEXT, XP INT);')
							.then((response) => log.discord(request.message.channel, { description: 'Created users table.' }))
							.catch((error) => log.unified(request.message.channel, 'Error creating users table.', error))
							.then(() => client.query('CREATE TABLE Guilds (ID TEXT, MotDID TEXT);'))
							.then((response) => log.discord(request.message.channel, { description: 'Created guilds table.' }))
							.catch((error) => log.unified(request.message.channel, 'Error creating guilds table.', error))
							.then(() => client.query('CREATE TABLE Invites (ID TEXT, RoleID TEXT);'))
							.then((response) => log.discord(request.message.channel, { description: 'Created invites table.' }))
							.catch((error) => log.unified(request.message.channel, 'Error creating invites table.', error))
							.then(() => client.end());
				})
				.catch((error) => log.unified(request.message.channel, 'Pool connect error.', error));
	}
};

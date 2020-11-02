const dotenv = require('dotenv');
const pg = require('pg');
const config = require('./config');
const log = require(`${config.LIB_DIR}log.js`);

// Load environment variables.
dotenv.config();

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }
});

pool.on('error', (error, client) => {
	if (error) { log.console('Pool error.', client, error); }
	pool.end();
});

pool.connect()
		.then((client) => {
			client.query('CREATE TABLE Users (ID TEXT, XP INT);')
					.then((response) => log.console('Created users table.', response))
					.catch((error) => log.console('Error creating users table.', error))
					.then(() => client.query('CREATE TABLE Guilds (ID TEXT, MotDID TEXT);'))
					.then((response) => log.console('Created guilds table.', response))
					.catch((error) => log.console('Error creating guilds table.', error))
					.then(() => client.query('CREATE TABLE Invites (ID TEXT, RoleID TEXT);'))
					.then((response) => log.console('Created invites table.', response))
					.catch((error) => log.console('Error creating invites table.', error))
					.then(() => client.end());
		})
		.catch((error) => log.console('Pool connect error.', error))
		.then(() => pool.end());

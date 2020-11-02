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
			client.query('DROP TABLE Users;')
					.then((response) => log.console('Dropped users table.', response))
					.catch((error) => log.console('Error dropping users table.', error))
					.then(() => client.query('DROP TABLE Guilds;'))
					.then((response) => log.console('Dropped guilds table.', response))
					.catch((error) => log.console('Error dropping guilds table.', error))
					.then(() => client.query('DROP TABLE Invites;'))
					.then((response) => log.console('Dropped invites table.', response))
					.catch((error) => log.console('Error dropping invites table.', error))
					.then(() => client.end());
		})
		.catch((error) => log.console('Pool connect error.', error))
		.then(() => pool.end());

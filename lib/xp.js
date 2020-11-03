const config = require('../config.js');
const log = require('./log.js');

module.exports = {
	cache: (client) => new Promise((resolve, reject) => {
		return client.pool.connect()
				.then((sqlClient) => sqlClient.query('SELECT * FROM Users;'))
				.then((response) => {
					client.xps = response.rows;
					log.console('CACHED INFORMATION:', response);
				})
				.catch((error) => log.console('Unable to cache XP information from SQL server', error));
	}),

	set: (user, xp) => new Promise((resolve, reject) => {
		if (user.client.xps.find((row) => row.id == user.id)) {
			user.client.xps.find((row) => row.id == user.id).xp = xp;
			return user.client.pool.connect()
					.then((sqlClient) => sqlClient.query(`UPDATE Users SET XP = ${xp} WHERE ID = ${user.id};`))
					.catch((error) => log.console('Unable to set XP for user in SQL server.', user.id, error));
		} else {
			return user.client.pool.connect()
					.then((sqlClient) => sqlClient.query(`INSERT INTO Users (ID, XP) VALUES (${user.id}, ${xp});`))
					.then((response) => user.client.xps.push(response))
					.catch((error) => log.console('Unable to update user XP in SQL server.', user.id, error));
		}
	}),

	increment: (user) => new Promise((resolve, reject) => {
		log.console('Incrementing client.xps', user.client.xps);
		const row = user.client.xps.find((row) => row.id == user.id);
		let base = 0;
		if (row) { base = row.xp; }
		module.exports.set(user, base + Math.random() * (config.MAX_MESSAGE_XP - config.MIN_MESSAGE_XP) + config.MIN_MESSAGE_XP);
	}),

	toLevel: (xp) => {
		let level = 0;
		while (xp > (Math.pow(config.LEVEL_REQUIREMENT_STEP_MULTIPLIER, level) * config.LEVEL_REQUIREMENT_MULTIPLIER * level)) { level++; }
		return level;
	}
};

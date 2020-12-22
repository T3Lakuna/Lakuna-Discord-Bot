const { MessageEmbed } = require('discord.js');

const DAY_LENGTH = 1000 * 60 * 60 * 24;

const DISCORD_EPOCH = 1420070400000;

const TIMESTAMP_BITS = 42;
const WORKER_BITS = 5;
const PROCESS_BITS = 5;
const INCREMENT_BITS = 12;

const dateToSnowflake = (date) => {
	// Convert date to BigInt to work with 64-bit snowflakes, and subtract the Discord epoch.
	date = BigInt(date.getTime() - DISCORD_EPOCH);
	
	// Convert date to binary, and fill other sections with zeros.
	let output = '';
	while (date > 0) {
		output = (date % 2n) + output;
		date = date / 2n;
	}
	while (output.length < TIMESTAMP_BITS) {
		output = 0 + output;
	}
	for (let i = 0; i < WORKER_BITS + PROCESS_BITS + INCREMENT_BITS; i++) {
		output += '0';
	}
	
	// Convert back to decimal and return a BigInt.
	return `${BigInt(`0b${output}`)}`;
};

module.exports = {
	names: ['motd'],
	usage: 'MOTD',
	description: 'Gets the best-voted meme posted in this server in the past day.',
	execute: (message, args) => new Promise((resolve, reject) => {
		let output = [];
		let fetched = 0;
		const channels = Array.from(message.guild.channels.cache.values()).filter((channel) => channel.type == 'text');
		for (const channel of channels) {
			channel.messages.fetch({ limit: 100, after: dateToSnowflake(new Date(new Date() - DAY_LENGTH)) }, false)
					.then((messages) => output = output.concat(Array.from(messages.values())))
					.catch((error) => { }) // Missing permisions; ignore channel.
					.finally(() => {
						fetched++;
						if (fetched >= channels.length) { resolve(output); }
					});
		}
	})
	.then((messages) => {
		// TODO
		console.log(`Got ${messages.length} messages.`);
	})
	.catch((error) => console.error(error))
};
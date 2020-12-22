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
		const getAllMessagesSince = (channel, snowflake, output = []) => new Promise((resolve, reject) => {
			channel.messages.fetch({ limit: 100, before: output.length ? Math.min(...output.map((message) => message.id)) : message.id }, false)
					.then((messages) => {
						messages = Array.from(messages.values());
						for (const message of messages) {
							if (message.id >= snowflake) {
								output.push(message);
							} else {
								break;
							}
						}

						if (!output.length) {
							return resolve([]);
						}

						if (output.length % 100 == 0) {
							return getAllMessagesSince(channel, snowflake, output).then((messages) => resolve(messages));
						}

						return resolve(output);
					})
					.catch((error) => resolve([])); // Missing permissions; ignore channel.
		});

		let output = [];
		let fetched = 0;
		const channels = Array.from(message.guild.channels.cache.values()).filter((channel) =>
				channel.type == 'text'
				&& channel.guild.me.permissionsIn(channel).has('VIEW_CHANNEL')
		);
		for (const channel of channels) {
			getAllMessagesSince(channel, dateToSnowflake(new Date(new Date() - DAY_LENGTH)))
					.then((messages) => output = output.concat(messages))
					.catch((error) => console.error(error))
					.finally(() => {
						fetched++;
						if (fetched >= channels.length) { resolve(output); }
					});
		}
	})
	.then((messages) => {
		let bestMeme;
		for (const message of messages) {
			const upvoteReaction = message.reactions.cache.find((reaction) => reaction.emoji.identifier == message.client.UPVOTE_IDENTIFIER);
			const upvotes = upvoteReaction ? upvoteReaction.count : 0;

			const downvoteReaction = message.reactions.cache.find((reaction) => reaction.emoji.identifier == message.client.DOWNVOTE_IDENTIFIER);
			const downvotes = downvoteReaction ? downvoteReaction.count : 0;

			const meme = {
				message: message,
				score: upvotes - downvotes
			};

			if (!bestMeme || bestMeme.score < meme.score) {
				bestMeme = meme;
			}
		}

		if (!bestMeme) {
			return message.channel.send(new MessageEmbed()
					.setColor(message.client.colors.WARNING)
					.setTitle('Failed to find any candidates.')
			);
		}

		// Build MotD message.
		const output = new MessageEmbed()
				.setColor(message.client.colors.INFO)
				.setTitle(`Meme of the Day ${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`)
				.setDescription(bestMeme.message.content)
				.setURL(bestMeme.message.url)
				.addField('Author', `${bestMeme.message.author}`, true)
				.addField('Score', bestMeme.score, true);

		// Get message attachments...
		const attachments = [];

		// ...from the text.
		for (const word of bestMeme.message.content.split(/ +/)) {
			if (word.startsWith('http')) { attachments.push(word); }
		}

		// ...from attachments.
		for (const attachment of bestMeme.message.attachments.values()) {
			attachments.push(attachment.url);
		}

		// Add attachments to message.
		if (attachments.length == 1) {
			if (
				attachments[0].endsWith('.png')
				|| attachments[0].endsWith('.jpg')
				|| attachments[0].endsWith('.jpeg')
				|| attachments[0].endsWith('.gif')
			) {
				output.setImage(attachments[0]);
			} else {
				output.attachFiles(attachments);
			}
		} else {
			output.attachFiles(attachments);
		}

		return message.channel.send(output);
	})
	.catch((error) => console.error(error))
};
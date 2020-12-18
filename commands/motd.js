const { MessageEmbed } = require('discord.js');

module.exports = {
	names: ['motd'],
	usage: 'MOTD',
	description: 'Gets the best-voted meme posted in this server in the past day.',
	execute: (message, args) => {
		new Promise((reject, resolve) => {
			const allMessages = [];
			const getMessages = (channel, sinceDate) => new Promise((resolve, reject) => {
				// TODO
				// Remember not to cache the messages (false in second parameter: channel.messages.fetch([options], false)).
				// Prune out messages that don't have both the upvote and downvote reactions here.
				// Prune messages by bots.
				// Prune messages not sent since sinceDate (do an additional check on each message after the fetch call).
			});

			const channels = Array.from(message.guild.channels.cache.values()).filter((channel) => channel.type == 'text');
			let channelsFetched = 0;
			const onChannelFetched = (messages) => {
				allMessages = allMessages.concat(messages);
				channelsFetched++;
				if (channelsFetched >= channels.length) { resolve(allMessages); }
			}

			for (const channel of channels) {
				getMessages(channel, new Date() - 1 /* (One day ago) */).then((messages) => onChannelFetched(messages));
			}
		}).then((messages) => {
			// TODO
		});
	}
};
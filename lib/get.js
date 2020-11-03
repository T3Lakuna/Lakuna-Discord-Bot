module.exports = {
	channel: (message, query) => {
		const channel = message.client.channels.cache.find((channel) =>
				channel == query
				|| channel.id == query
				|| channel.name == query
		);
		if (!channel) { throw new Error(`Unable to find channel from query "${query}".`); }
		return channel;
	},

	emoji: (message, query) => {
		if (query.startsWith && query.startsWith("<:")) { query = query.substring("<:".length, query.length - ">".length); }
		const emoji = message.client.emojis.cache.find((emoji) =>
				emoji == query
				|| emoji.id == query
				|| emoji.identifier == query
				|| emoji.name == query
		);
		if (!emoji) { throw new Error(`Unable to find emoji from query "${query}".`); }
		return emoji;
	},

	guild: (message, query) => {
		const guild = message.client.guilds.cache.find((guild) =>
				guild == query
				|| guild.id == query
				|| guild.name == query
		);
		if (!guild) { throw new Error(`Unable to find guild from query "${query}".`); }
		return guild;
	},

	member: (message, query) => {
		if (query.startsWith && query.startsWith("<@!")) { query = query.substring("<@!".length, query.length - ">".length); }
		if (!message.guild) { throw new Error('Cannot get a member outside of a guild.'); }
		const member = message.guild.members.cache.find((member) =>
				member == query
				|| member.displayName == query
				|| member.id == query
				|| member.nickname == query
				|| member.user == query
				|| member.user.id == query
				|| member.user.tag == query
				|| member.user.username == query
		);
		if (!member) { throw new Error(`Unable to find member from query "${query}".`); }
		return member;
	},

	invite: (message, query) => new Promise((resolve, reject) => {
		const invite = guild.client.invites.get(message.guild.id).find((invite) =>
				invite == query
				|| invite.code == query
				|| invite.url == query
		);
		if (!invite) { throw new Error(`Unable to find invite from query "${query}".`); }
		return invite;
	}),

	message: (message, channelQuery, query) => {
		const channel = module.exports.channel(message, channelQuery);
		const output = channel.messages.cache.find((message) =>
				message == query
				|| message.id == query
				|| message.url == query
		);
		if (!output) { throw new Error(`Unable to find message from query "${query}".`); }
		return output;
	},

	role: (message, query) => {
		if (query.startsWith && query.startsWith("<@&")) { query = query.substring("<@&".length, query.length - ">".length); }
		const role = message.guild.roles.cache.find((role) =>
				role == query
				|| role.id == query
				|| role.name == query
		);
		if (!role) { throw new Error(`Unable to find role from query "${query}".`); }
		return role;
	},

	user: (message, query) => {
		if (query.startsWith && query.startsWith("<@!")) { query = query.substring("<@!".length, query.length - ">".length); }
		const user = client.users.cache.find((user) =>
				user == query
				|| user.id == query
				|| user.tag == query
				|| user.username == query
				|| user == query.user // In case query is a GuildMember.
		);
		if (!user) { throw new Error(`Unable to find user from query "${query}".`); }
		return user;
	}
};

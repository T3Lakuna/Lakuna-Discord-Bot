const discord = require('discord.js');

module.exports = {
	cache: (clientOrGuild) => new Promise((resolve, reject) => {
		if (clientOrGuild instanceof discord.Client) {
			if (!clientOrGuild.invites) { clientOrGuild.invites = new discord.Collection(); }
			clientOrGuild.guilds.cache.forEach((guild) => guild.fetchInvites()
					.then((invites) => clientOrGuild.invites.set(guild.id, invites))
					.catch((error) => { }) // Missing permissions.
			);
			resolve();
		} else if (clientOrGuild instanceof discord.Guild) {
			if (!clientOrGuild.client.invites) { clientOrGuild.client.invites = new discord.Collection(); }
			clientOrGuild.fetchInvites()
					.then((invites) => {
						clientOrGuild.client.invites.set(clientOrGuild.id, invites);
						resolve();
					})
					.catch((error) => { reject(error); }) // Missing permissions.
		} else { reject(new Error('Must supply a client or a guild.')); }
	}),

	findUsed: (guild) => new Promise((resolve, reject) => {
		const oldInv = guild.client.invites.get(guild.id);
		module.exports.cache(guild)
				.then(() => {
					const newInv = guild.client.invites.get(guild.id);
					const usedInv = newInv.find((invite) => oldInv.get(invite.code).uses < invite.uses);
					resolve(usedInv);
				})
				.catch((error) => reject(error));
	})
};

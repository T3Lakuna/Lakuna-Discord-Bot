// Load libraries.
const log = require('./log.js');

module.exports = {
	get: (member) => {
		try {
			log.console('Guild memory:', member.client.memory); // TODO: Delete.

			// Get old invites.
			const guildMemory = member.client.memory.get(member.guild.id);
			const oldInvites = guildMemory.invites;

			// Fetch current invites.
			member.guild.fetchInvites()
					.then((invites) => {
						// Save new invites.
						guildMemory.invites = invites;
						member.client.memory.set(member.guild.id, guildMemory);

						// Find used invite.
						const usedInvite = invites.find((invite) => oldInvites.get(invite.code).uses < invite.uses);
						if (usedInvite) {
							log.guild(log.types.INFO, member.guild, `${member} joined the server using invite \`${usedInvite.code}\`.`);
						} else {
							log.guild(log.types.INFO, member.guild, `${member} joined the server using an unknown invite.`);
						}

						return usedInvite;
					})
					.catch((error) => log.unified(log.types.ERROR, member.guild, 'There was an error fetching guild invites.', error));
		} catch (error) { log.unified(log.types.ERROR, member.guild, `${member} joined the server, but there was an error getting the invite.`, error); }
	}
};

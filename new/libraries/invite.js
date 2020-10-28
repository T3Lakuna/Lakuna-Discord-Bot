// Load libraries.
const log = require('./log.js');
const memory = require('./memory.js');

module.exports = {
	// TODO: Make memory.cache return a promise so that .then can be used here to make this work.
	// TODO: Also if possible have the cache modify itself so that re-specifying the guildData variable isn't necessary.
	get: (member) => {
		try {
			let guildData = member.client.memory.get(member.guild.id);
			if (!guildData) { return log.unified(log.types.ERROR, member.guild, 'Guild memory does not exist. Please contact the bot author.', 'Method invite.get.'); }

			// Get old invites.
			const oldInvites = guildData.invites;

			// Get new invites.
			guildData.cache({ parts: [memory.parts.INVITES] });
			guildData = member.client.memory.get(member.guild.id);
			const newInvites = guildData.invites;

			// Find used invite.
			const usedInvite = newInvites.find((invite) => oldInvites.get(invite.code).uses < invite.uses);
			if (usedInvite) {
				log.guild(log.types.INFO, member.guild, `${member} joined the server using invite \`${usedInvite.code}\`.`);
			} else {
				log.guild(log.types.INFO, member.guild, `${member} joined the server using an unknown invite.`);
			}

			return usedInvite;
		} catch (error) { log.unified(log.types.ERROR, member.guild, `${member} joined the server, but there was an error getting the invite.`, error); }
	}
};

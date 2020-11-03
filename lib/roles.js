const config = require('../config.js');
const get = require('./get.js');

module.exports = {
	addFromReaction: (reaction, user) => new Promise((resolve, reject) => {
		const addFromReactionCached = () => new Promise((resolve, reject) => {
			if (reaction.message.author != reaction.client.user) { return; } // Messages not from bot can't be RRs.
			if (user.bot) { return; } // Don't give RRs to bots.
			if (!reaction.message.embeds) { return; } // RRs must have a rich embed.
			const embed = reaction.message.embeds[0];
			if (embed.title != config.REACTION_ROLE_EMBED_NAME) { return; } // Embed must be a role reaction embed.

			const member = get.member(reaction.message, user);
			embed.fields.forEach((field) => {
				const role = get.role(reaction.message, field.value);
				if (get.emoji(reaction.message, field.name) != reaction.emoji) { return; }
				if (member.roles.cache.has(role.id)) {
					// Remove role.
					member.roles.remove(role).catch((error) => log.console(`Error removing role "${role}" from member "${member}".`, error));
				} else {
					// Add role.
					member.roles.add(role).catch((error) => log.console(`Error adding role "${role}" to member "${member}".`, error));
				}
				reaction.users.remove(user);
			});
		});

		if (reaction.message.partial) { return reaction.message.fetch().then(() => addFromReactionCached()); } else { return addFromReactionCached(); }
	})
};

// Weeb, League, Games, MTG, Developer, TTV Announcements, Announcements
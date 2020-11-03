const discord = require('discord.js');
const config = require('../config.js');
const log = require(`.${config.LIB_DIR}log.js`);
const cmd = require(`.${config.LIB_DIR}cmd.js`);
const get = require(`.${config.LIB_DIR}get.js`);

module.exports = {
	aliases: ['rr', 'reaction_roles'],
	usage: 'RR (Emoji) (Role) [Emoji] [Role]...',
	description: 'Creates a message which users can react to for roles.',
	category: cmd.categories.UNCATEGORIZED,
	execute: (request) => {
		if (!request.message.member.permissionsIn(request.message.channel).has('ADMINISTRATOR')) {
			log.discord(message.channel, {
				color: log.colors.WARNING,
				description: 'You must be an administrator to use this command.',
				title: 'Insufficient permissions.'  
			});
			return false;
		}

		const output = {
			fields: [],
			description: 'React to this message with the following emojis to get the listed role.',
			title: config.REACTION_ROLE_EMBED_NAME
		};

		const emojis = [];
		// Add emoji-role pairs to embed.
		for (let i = 0; i < request.args.length - 1; i += 2) {
			let emoji, role;
			try { emoji = get.emoji(request.message, request.args[i]); } catch (error) {
				log.discord(request.message.channel, {
					color: log.colors.WARNING,
					description: `Unable to find emoji "${request.args[i]}".`,
					title: 'Unable to find emoji.'
				});
				return false; // Failed command.
			}
			try { role = get.role(request.message, request.args[i + 1]); } catch (error) {
				log.discord(request.message.channel, {
					color: log.colors.WARNING,
					description: `Unable to find role "${request.args[i + 1]}".`,
					title: 'Unable to find role.'
				});
				return false; // Failed command.
			}

			output.fields.push({ name: `${emoji}`, value: `${role}` });
			emojis.push(emoji);
		}

		log.discord(request.message.channel, output).then((message) => emojis.forEach((emoji) => message.react(emoji)));

		return true; // Command success.
	}
};

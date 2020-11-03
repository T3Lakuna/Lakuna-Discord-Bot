const discord = require('discord.js');
const settings = require('./settings.js');

module.exports = {
	// Enumeration of log colors.
	colors: {
		SUCCESS: '#32CD32',
		WARNING: '#FDEE00',
		ERROR: '#FF2400',
		INFO: '#007FFF'
	},

	// Creates a message embed.
	createEmbed: (suppliedSettings) => {
		// Default settings.
		const usedSettings = settings.fillDefaults(suppliedSettings, {
			fields: [{ name: 'Name', value: 'Value', inline: true }],
			files: [],
			author: suppliedSettings.author ? { name: 'Name', iconURL: undefined, url: undefined } : undefined,
			color: module.exports.colors.INFO,
			description: undefined,
			footer: suppliedSettings.footer ? { text: 'Footer', iconURL: undefined } : undefined,
			imageURL: undefined,
			thumbnailURL: undefined,
			timestamp: Date.now(),
			title: 'Lakuna - Info',
			url: undefined
		});

		// Apply normal settings.
		let output = new discord.MessageEmbed();
		for (const field of usedSettings.fields) { output.addField(field.name, field.value, field.inline); }
		if (usedSettings.files.length > 0) { output.attachFiles(usedSettings.files); }
		if (usedSettings.author) { output.setAuthor(usedSettings.author.name, usedSettings.author.iconURL, usedSettings.author.url); }
		if (usedSettings.color) { output.setColor(usedSettings.color); }
		if (usedSettings.description) { output.setDescription(usedSettings.description); }
		if (usedSettings.footer) { output.setFooter(usedSettings.footer.text, usedSettings.footer.iconURL); }
		if (usedSettings.imageURL) { output.setImage(usedSettings.imageURL); }
		if (usedSettings.thumbnailURL) { output.setThumbnail(usedSettings.thumbnailURL); }
		if (usedSettings.timestamp) { output.setTimestamp(usedSettings.timestamp); }
		if (usedSettings.title) { output.setTitle(usedSettings.title); }
		if (usedSettings.url) { output.setURL(usedSettings.url); }

		return output; // Return message embed.
	},

	// For use with errors.
	console: (...messages) => new Promise((resolve, reject) => {
		let output = `[${new Date().toISOString()}]\n`;
		for (const message of messages) {
			if (typeof message == 'object') {
				// Objects (object).
				if (message && typeof message[Symbol.iterator] == 'function') {
					// Iterable objects.
					output += '\tIterable:\n';
					for (const part of message) { output += `\t\t${part}\n`; }
				} else if (JSON.stringify(message) != '{}') {
					// Non-iterable, JSON-ifiable objects.
					output += `\t${JSON.stringify(message)}\n`;
				} else {
					// Non-iterable, non-JSON-ifiable objects.
					output += `\t${message}\n`;
				}
			} else {
				// Primitives (boolean, function, number, string, undefined).
				output += `\t${message}\n`;
			}
		}

		console.log(output);

		resolve(); // Success.
	}),

	// For use with successes, warnings, and information.
	discord: (channelOrGuild, suppliedSettings) => new Promise((resolve, reject) => {
		if (channelOrGuild instanceof discord.Guild) {
			if (!channelOrGuild.systemChannel) { return; } // Cannot log to guild without a system channel.

			// Is guild.
			return channelOrGuild.systemChannel.send(module.exports.createEmbed(suppliedSettings))
					.then((message) => resolve(message)) // Success.
					.catch((error) => { }); // Missing permissions.
		} else if (channelOrGuild instanceof discord.Channel) {
			// Is channel.
			return channelOrGuild.send(module.exports.createEmbed(suppliedSettings))
					.then((message) => resolve(message)) // Success.
					.catch((error) => { }); // Missing permissions
		} else { throw new Error('The passed value must be a channel or a guild.'); }
	}),

	// For use with errors.
	unified: (channelOrGuild, ...messages) => new Promise((resolve, reject) => {
		// Log to console.
		module.exports.console(...messages)
				.then(() => {
					// Log to Discord.
					let suppliedSettings = {
						fields: [],
						color: module.exports.colors.ERROR,
						title: 'Lakuna - Error'
					};
					for (const message of messages) {
						if (!suppliedSettings.description) {
							suppliedSettings.description = message;
						} else {
							suppliedSettings.fields.push({ name: 'Message', value: message });
						}
					}
					return module.exports.discord(channelOrGuild, suppliedSettings);
				})
				.then((message) => resolve(message))
				.catch((error) => { }); // Missing permissions.
	})
};

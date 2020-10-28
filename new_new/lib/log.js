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

	// Log messages to a channel.
	channel: (logSettings) => {
		// Default settings.
		logSettings = settings.fillDefaults(logSettings, {
			title: 'Message',
			color: module.exports.colors.INFO,
			description: null,

		});

		let output = new discord.MessageEmbed();
		if (logSettings.title) { output.setTitle(logSettings.title); }
		if (logSettings.color) { output.setColor(logSettings.color); }
		if (logSettings.description) { output.setDescription(logSettings.description); }

		// TODO: Parts.
	}
};

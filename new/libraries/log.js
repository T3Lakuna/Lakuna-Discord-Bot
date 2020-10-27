// Load libraries.
const discord = require('discord.js');
const colors = require('./colors.js');

module.exports = {
	// Enumeration of log types.
	types: {
		SUCCESS: 'success',
		WARNING: 'warning',
		ERROR: 'error',
		INFO: 'info'
	},

	channel: (logType, channel, ...messages) => {
		// Get log type color.
		let usedColor;
		switch (logType) {
			case module.exports.types.SUCCESS: usedColor = colors.GREEN; break;
			case module.exports.types.WARNING: usedColor = colors.YELLOW; break;
			case module.exports.types.ERROR: usedColor = colors.RED; break
			case module.exports.types.INFO: usedColor = colors.BLUE; break;
			default: log(module.exports.types.ERROR, guild, `Unknown log type "${logType}".`);
		}

		// Build MessageEmbed.
		let channelOutput = new discord.MessageEmbed()
				.setColor(usedColor)
				.setDescription(messages[0])
				.setTitle(`Lakuna: ${logType}`);
		for (let i = 1; i < messages.length; i++) { channelOutput.addField(`Part ${i}`, messages[i]); }

		// Send MessageEmbed.
		channel.send(channelOutput);
	},

	guild: (logType, guild, ...messages) => {
		if (guild && guild.systemChannel) { module.exports.channel(logType, guild.systemChannel, ...messages); }
	},

	console: (...messages) => {
		let consoleOutput = `[${new Date().toISOString()}]\n`;
		messages.forEach((message) => consoleOutput += `\t${message}\n`);
		console.log(consoleOutput);
	},

	unified: (logType, guild, ...messages) => {
		module.exports.console(...messages);
		module.exports.guild(logType, guild, ...messages);
	}
};

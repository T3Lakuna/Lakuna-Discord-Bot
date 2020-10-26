// Load libraries.
const discord = require('discord.js');
const colors = require('./colors.js');

// Enumeration for log type.
const types = { SUCCESS: 'success', WARNING: 'warning', ERROR: 'error', INFO: 'info' };
exports.types = types;

const channel = (logType, channel, ...messages) => {
	// Get log type color.
	let usedColor;
	switch (logType) {
		case types.SUCCESS: usedColor = colors.GREEN; break;
		case types.WARNING: usedColor = colors.YELLOW; break;
		case types.ERROR: usedColor = colors.RED; break
		case types.INFO: usedColor = colors.BLUE; break;
		default: log(types.ERROR, guild, `Unknown log type "${logType}".`);
	}

	// Build MessageEmbed.
	let channelOutput = new discord.MessageEmbed()
			.setColor(usedColor)
			.setDescription(messages[0])
			.setTitle(`Lakuna: ${logType}`);
	for (let i = 1; i < messages.length; i++) { channelOutput.addField(`Part ${i}`, messages[i]); }

	// Send MessageEmbed.
	channel.send(channelOutput);
}
exports.channel = channel;

const guild = (logType, guild, ...messages) => {
	if (guild && guild.systemChannel) { channel(logType, guild.systemChannel, ...messages); }
}
exports.guild = guild;

// Log to console.
const console = (...messages) => {
	let consoleOutput = `[${new Date().toISOString()}]\n`;
	messages.forEach((message) => consoleOutput += `\t${message}\n`);
	console.log(`${consoleOutput}`);
}
exports.console = console;

// Log to guild and console.
const unified = (logType, guild, ...messages) => {
	console(...messages);
	guild(logType, guild, ...messages);
};
exports.unified = unified;

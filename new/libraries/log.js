// Load libraries.
const discord = require('discord.js');
const colors = require('./colors.js');

// Enumeration for log type.
const types = { SUCCESS: 'success', WARNING: 'warning', ERROR: 'error', INFO: 'info' };
exports.types = types;

// Convenience method for logging to server and console.
exports.unified = (logType, guild, ...messages) => {
	// Get log type information.
	let usedColor;
	switch (logType) {
		case types.SUCCESS: usedColor = colors.GREEN; break;
		case types.WARNING: usedColor = colors.YELLOW; break;
		case types.ERROR: usedColor = colors.RED; break
		case types.INFO: usedColor = colors.BLUE; break;
		default: log(types.ERROR, guild, `Unknown log type "${logType}".`);
	}

	// Console output.
	if (guild == null || logType == types.ERROR) {
		let consoleOutput = `[${new Date().toISOString()}] ${logType}:\n`;
		messages.forEach((message) => consoleOutput += `\t${message}\n`);
		console.log(`${consoleOutput}`);
	}

	// Guild output.
	if (guild && guild.systemChannel) {
		let guildOutput = new discord.MessageEmbed()
				.setColor(usedColor)
				.setDescription(messages[0])
				.setTitle(`Lakuna: ${logType}`);
		for (let i = 1; i < messages.length; i++) { guildOutput.addField(`Message ${i}`, messages[i]); }

		guild.systemChannel.send(guildOutput);
	}
};

exports.console = (...messages) => {
	let consoleOutput = `[${new Date().toISOString()}]\n`;
	messages.forEach((message) => consoleOutput += `\t${message}\n`);
	console.log(`${consoleOutput}`);
}

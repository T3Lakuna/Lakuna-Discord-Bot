module.exports = {
	name: "role",
	description: "View information about a role",
	usage: "ROLE (Role)",
	numRequiredArgs: 1,
	execute(message, args) {
		const discord = require("discord.js");

		const role = message.client.getRole(message, args[0]);
		if (!role) { return; }

		const output = new discord.MessageEmbed()
				.setColor(message.client.SUCCESS_HEX)
				.setTitle("Role " + role.name + " #" + role.id)
				.addField("Color", role.color, true)
				.addField("Created At", role.createdAt.toISOString(), true)
				.addField("Hex Color", role.hexColor, true)
				.addField("Members", role.members.size, true)
				.addField("Position", role.position, true);
		if (role.hoist) { output.addField("Hoist", role.hoist, true); }
		if (role.managed) { output.addField("Managed", role.managed, true); }
		if (role.mentionable) { output.addField("Mentionable", role.mentionable, true); }
		return message.channel.send(output);
	}
}

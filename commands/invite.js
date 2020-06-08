module.exports = {
	name: "invite",
	description: "Get the invite link for the bot",
	usage: "INVITE",
	execute(message, args) {
		const discord = require("discord.js");

		return message.channel.send(new discord.MessageEmbed()
					.setColor(message.client.SUCCESS_HEX)
					.setTitle("Invite")
					.setURL(`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=0&scope=bot`)
					.setDescription("Invite Lakuna to your server.")
		);
	}
}

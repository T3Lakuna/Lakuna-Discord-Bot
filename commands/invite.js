module.exports = {
	name: "invite",
	description: "Get the invite link for the bot",
	usage: "INVITE",
	execute(message, args) {
		const discord = require("discord.js");

		return message.channel.send(new discord.MessageEmbed()
					.setColor("#a4c639")
					.setTitle("Invite")
					.setURL("https://discordapp.com/api/oauth2/authorize?client_id=686092493787234326&permissions=0&scope=bot")
					.setDescription("Invite Lakuna to your server.")
		);
	}
}

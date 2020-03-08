module.exports = {
	name: "invite",
	description: "Get the invite link for the bot",
	usage: "INVITE",
	execute(message, args) { message.channel.send("https://discordapp.com/api/oauth2/authorize?client_id=686092493787234326&permissions=0&scope=bot"); }
}

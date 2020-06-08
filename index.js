const fs = require("fs");
const discord = require("discord.js");
const dotenv = require("dotenv");

dotenv.config(); // Get environment variables when running on desktop.

const PREFIX = "~";

// Create client.
const client = new discord.Client({ partials: ['MESSAGE', 'REACTION'] });

// Define colors.
client.SUCCESS_HEX = "#50c878";
client.INFO_HEX = "#5078c8";
client.WARNING_HEX = "#c80815";
client.ROLE_REACTION_TITLE = "Role Reactions";

// Setup commands.
client.commands = new discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"))
for (const file of commandFiles) {
	const command = require("./commands/" + file);
	client.commands.set(command.name, command);
}

client.on("ready", () => client.user.setActivity("~help"));

// React to commands.
client.on("message", message => {
	if (message.author.bot) { return; }
	if (!message.content.startsWith(PREFIX)) { return; }

	const args = message.content.slice(PREFIX.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (commandName.startsWith(PREFIX)) { return; } // Prevent markdown from registering as commands.
	if (!client.commands.has(commandName)) {
		return message.channel.send(new discord.MessageEmbed()
				.setColor(client.INFO_HEX)
				.setTitle("Unknown command \"" + commandName + "\"")
		);
	}

	const command = client.commands.get(commandName);

	if (command.numRequiredArgs && args.length < command.numRequiredArgs) {
		return message.channel.send(new discord.MessageEmbed()
				.setColor("#c80815")
				.setTitle("Usage: " + command.usage)
		);
	}

	command.execute(message, args);
	
	message.delete().catch(error => { });
});

client.on("messageReactionAdd", async (reaction, user) => {
	// Get message and ensure that it is a role reaction message.
	if (reaction.message.partial) { await reaction.message.fetch(); }
	if (reaction.message.author != client.user) { return; }
	if (user.bot) { return; }
	if (!reaction.message.embeds) { return; }
	const embed = reaction.message.embeds[0];
	if (embed.title != client.ROLE_REACTION_TITLE) { return; }

	// Add roles based on reactions.
	embed.fields.forEach(field => {
		if (client.getEmoji(reaction.message, field.name) == reaction.emoji) { user.presence.member.roles.add(client.getRole(reaction.message, field.value)); }
	});
});

client.on("messageReactionRemove", async (reaction, user) => {
	// Get message and ensure that it is a role reaction message.
	if (reaction.message.partial) { await reaction.message.fetch(); }
	if (reaction.message.author != client.user) { return; }
	if (user.bot) { return; }
	if (!reaction.message.embeds) { return; }
	const embed = reaction.message.embeds[0];
	if (embed.title != client.ROLE_REACTION_TITLE) { return; }

	// Add roles based on reactions.
	embed.fields.forEach(field => {
		if (client.getEmoji(reaction.message, field.name) == reaction.emoji) { user.presence.member.roles.remove(client.getRole(reaction.message, field.value)); }
	});
});

client.on("error", error => console.log(`Client error: ${error}`));

// Login.
client.login(process.env.TOKEN);

// Reusable methods.
client.getChannel = (message, query) => {
	const channel = client.channels.cache.find(channel => channel.id == query || channel.name == query);
	if (!channel) {
		message.channel.send(new discord.MessageEmbed()
				.setColor(client.WARNING_HEX)
				.setTitle(`Error getting channel [${query}].`)
		);
	}
	return channel;
}

client.getEmoji = (message, query) => {
	if (query.startsWith("<:")) { query = query.substring("<:".length, query.length - ">".length); }
	const emoji = client.emojis.cache.find(emoji => emoji.name == query || emoji.identifier == query || emoji.id == query);
	if (!emoji) {
		message.channel.send(new discord.MessageEmbed()
				.setColor(client.WARNING_HEX)
				.setTitle(`Error getting emoji [${query}].`)
		);
	}
	return emoji;
}

client.getRole = (message, query) => {
	if (query.startsWith("<@&")) { query = query.substring("<@&".length, query.length - ">".length); }
	const role = message.guild.roles.cache.find(role => role.id == query || role.name == query || role.toString() == query);
	if (!role) {
		message.channel.send(new discord.MessageEmbed()
				.setColor(client.WARNING_HEX)
				.setTitle(`Error getting role [${query}].`)
		);
	}
	return role;
}

client.getUser = (message, query) => {
	if (query.startsWith("<@!")) { query = query.substring("<@!".length, query.length - ">".length); }
	let user = client.users.cache.find(user => user.id == query || user.tag == query || user.username == query);
	const member = message.guild.members.cache.find(member => member.displayName == query || member.nickname == query);
	if (member) { user = member.user; }
	if (!user) {
		message.channel.send(new discord.MessageEmbed()
				.setColor(message.client.WARNING_HEX)
				.setTitle(`Error getting user [${query}].`)
		);
	}
	return user;
}

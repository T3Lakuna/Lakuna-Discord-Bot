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

client.on("ready", () => {
	console.log("Ready.");

	// Cache invite links for invite link message.
	client.guildInvites = new Map();
	client.guilds.cache.forEach((guild) => {
		guild.fetchInvites()
				.then((invites) => client.guildInvites.set(guild.id, invites))
				.catch((error) => console.log(`Error fetching invites for guild [${guild}]:\n${error}`));
	});

	client.user.setActivity("~help");
});

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
		const role = client.getRole(reaction.message, field.value);
		const member = reaction.message.guild.members.cache.find(member => member.id == user.id);
		if (client.getEmoji(reaction.message, field.name) == reaction.emoji) { member.roles.add(role).catch(error => console.log(`Error adding role [${role}] to [${member}]:\n${error}`)); }
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

	// Remove roles based on reactions.
	embed.fields.forEach(field => {
		const role = client.getRole(reaction.message, field.value);
		const member = reaction.message.guild.members.cache.find(member => member.id == user.id);
		if (client.getEmoji(reaction.message, field.name) == reaction.emoji) { member.roles.remove(role).catch(error => console.log(`Error removing role [${role}] from [${member}]:\n${error}`)); }
	});
});

client.on("guildMemberAdd", async (member) => {
	try {
		const oldInvites = client.guildInvites.get(member.guild.id);
		const newInvites = await member.guild.fetchInvites();
		client.guildInvites.set(member.guild.id, newInvites);
		const usedInvite = newInvites.find((invite) => oldInvites.get(invite.code).uses < invite.uses);

		member.guild.systemChannel.send(new discord.MessageEmbed()
				.setColor(client.INFO_HEX)
				.setTitle(`User ${member.displayName} joined the server.`)
				.setImage(member.user.displayAvatarURL())
				.addField("Invite Code", usedInvite.code, true)
				.addField("Inviter", usedInvite.inviter.id, true)
		);
	} catch (error) {
		member.guild.systemChannel.send(new discord.MessageEmbed()
				.setColor(client.INFO_HEX)
				.setTitle(`User ${member.displayName} joined the server.`)
				.setDescription("Lacking permission to check invite link: Manage Server.")
				.setImage(member.user.displayAvatarURL())
		);
	}
});

client.on('inviteCreate', async (invite) => client.guildInvites.set(invite.guild.id, await invite.guild.fetchInvites()));

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
	const emoji = client.emojis.cache.find(emoji => emoji.name == query || emoji.identifier == query || emoji.id == query || emoji.toString() == query);
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

client.getUser = (message, query) => client.getUser(message, query, true);

client.getUser = (message, query, recursive) => {
	if (query.startsWith("<@!")) { query = query.substring("<@!".length, query.length - ">".length); }
	let user = client.users.cache.find(user => user.id == query || user.tag == query || user.username == query || user.toString() == query);
	let member;
	if (recursive) { member = client.getMember(message, query, false); }
	if (member) { user = member.user; }
	if (!user) {
		message.channel.send(new discord.MessageEmbed()
				.setColor(message.client.WARNING_HEX)
				.setTitle(`Error getting user [${query}].`)
		);
	}
	return user;
}

// user => user.id == query || user.tag == query || user.username == query || user.toString() == query
// member => member.displayName == query || member.id == query || member.nickname == query || member.toString() == query

client.getMember = (message, query) => client.getMember(message, query, true);

client.getMember = (message, query, recursive) => {
	if (query.startsWith("<@!")) { query = query.substring("<@!".length, query.length - ">".length); }
	if (!message.guild) { return null; }
	let member = message.guild.members.cache.find(member => member.displayName == query || member.id == query || member.nickname == query || member.toString() == query);
	let user;
	if (recursive) { user = client.getUser(message, query, false); }
	if (user) { member = message.guild.members.cache.find(member => member.id == user.id); }
	if (!member) {
		message.channel.send(new discord.MessageEmbed()
				.setColor(message.client.WARNING_HEX)
				.setTitle(`Error getting member [${query}].`)
		);
	}
	return member;
}

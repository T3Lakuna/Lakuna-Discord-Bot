const { MessageEmbed } = require('discord.js');

module.exports = {
	names: ['about', 'info', 'stats'],
	usage: 'ABOUT',
	description: 'Displays bot information.',
	execute: (message, args) => {
		const formatTime = (time) => {
			const pad = (n, z = 2) => ('00' + n).slice(-z);

			const ms = time % 1000; time = (time - ms) / 1000;
			const s = time % 60; time = (time - s) / 60;
			const m = time % 60; time = (time - m) / 60;
			const h = time;

			return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
		};
		
		return message.client.shard.fetchClientValues('guilds.cache.size')
			.then((response) => message.channel.send(new MessageEmbed()
				.setColor(message.client.colors.INFO)
				.setTitle('Bot Information')
				.setDescription('Lakuna is developed by Travis Martin and is licensed under the GNU Affero General Public License version 3.0.')
				.setThumbnail(message.client.user.displayAvatarURL())
				.addField('Ready Time', message.client.readyAt.toISOString(), true)
				.addField('Guild Count', response.reduce((a, c) => a + c), true)
				.addField('Shard Count', message.client.shard.count, true)
				.addField('Uptime', formatTime(message.client.uptime), true)
				.addField('User', `${message.client.user}`, true)
				.addField('Source Code', message.client.urls.REPO, true)
				.addField('Report an Issue', message.client.urls.ISSUE, true)
				.addField('Website', message.client.urls.WEBSITE, true)
				.addField('Support Server', message.client.urls.SUPPORT, true)
			)).catch((error) => console.log);
	}
};
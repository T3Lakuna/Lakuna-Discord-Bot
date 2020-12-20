const { MessageEmbed } = require('discord.js');
const request = require('bent')('GET', 'json', { 'X-Riot-Token': process.env.RIOT_API_KEY });

module.exports = {
	names: ['lol', 'league'],
	usage: 'LOL (Region) (Username)',
	description: 'Returns basic summoner stats and a live spectate command for a League of Legends account.',
	execute: (message, args) => {
		const regionQuery = args.shift().toLowerCase();
		const summonerNameQuery = args.join(' ');

		let region, spectatorRegion, opRegion;
		if (regionQuery.includes('b')) {
			region = 'br1'; // Brazil (BR / BR1)
			spectatorRegion = 'br';
			opRegion = 'br';
		} else if (regionQuery.includes('eu') || regionQuery.includes('nordic')) {
			if (regionQuery.includes('w')) {
				region = 'euw1'; // Europe West (EUW / EUW1)
				spectatorRegion = 'euw1';
				opRegion = 'euw';
			} else {
				region = 'eun1'; // Europe Nordic & East (EUNE / EUN1)
				spectatorRegion = 'eu';
				opRegion = 'eune';
			}
		} else if (regionQuery.includes('la')) {
			if (regionQuery.includes('n') || regionQuery.includes('1')) {
				region = 'la1'; // Latin America North (LAN / LA1)
				spectatorRegion = 'la1';
				opRegion = 'lan';
			} else {
				region = 'la2'; // Latin America South (LAS / LA2)
				spectatorRegion = 'la2';
				opRegion = 'las';
			}
		} else if (regionQuery.includes('oc')) {
			region = 'oc1'; // Oceania (OCE / OC1)
			spectatorRegion = 'oc1';
			opRegion = 'oce';
		} else if (regionQuery.includes('ru')) {
			region = 'ru'; // Russia (RU / RU1)
			spectatorRegion = 'ru';
			opRegion = 'ru';
		} else if (regionQuery.includes('tu') || regionQuery.includes('tr')) {
			region = 'tr1'; // Turkey (TR / TR1)
			spectatorRegion = 'tr';
			opRegion = 'tr';
		} else if (regionQuery.includes('j')) {
			region = 'jp1'; // Japan (JP / JP1)
			spectatorRegion = 'jp1';
			opRegion = 'jp';
		} else if (regionQuery.includes('k')) {
			region = 'kr'; // Republic of Korea (KR)
			spectatorRegion = 'kr';
			opRegion = '';
		} else if (regionQuery.includes('public') || regionQuery.includes('beta') || regionQuery == 'pbe') {
			region = 'pbe'; // Public Beta Environment (PBE)
		} else {
			region = 'na1'; // North America (NA / NA1)
			spectatorRegion = 'na';
			opRegion = 'na';
		}

		let summoner, ddragonVersion;
		request(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerNameQuery.replace(/ /g, '%20')}`)
				.then((response) => {
					summoner = response;
					return request('https://ddragon.leagueoflegends.com/api/versions.json');
				})
				.then((response) => {
					ddragonVersion = response[0];
					return request(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`);
				})
				.then((response) => {
					const embed = new MessageEmbed()
							.setColor(message.client.colors.INFO)
							.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${summoner.profileIconId}.png`)
							.setTitle(`Stats for ${summonerNameQuery}`)
							.setFooter(`ddragon version: ${ddragonVersion}`);

					if (!response.length) { return message.channel.send(embed); }

					summonerName = response[0].summonerName;

					embed
							.setTitle(`Stats for ${summonerName}`)
							.setURL(`https://${opRegion}.op.gg/summoner/userName=${summonerName.replace(/ /g, '%20')}`);

					const ranked = response.find((leagueEntry) => leagueEntry.queueType == 'RANKED_SOLO_5x5');
					if (ranked) {
						embed
								.addField('Rank', `${ranked.tier} ${ranked.rank} (${ranked.leaguePoints} LP)`, true)
								.addField('Ranked Winrate', `${Math.round(ranked.wins / (ranked.wins + ranked.losses) * 1000) / 10}%`, true)
								.addField('Ranked Status', `${ranked.inactive ? 'Inactive' : (ranked.veteran ? 'Veteran' : (ranked.freshBlood ? 'Newcomer' : 'Active'))}`, true);
					}

					return request(`https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner.id}`)
							.then((response) => message.channel.send(embed.addField('Spectate Command', `\`\`\`powershell\ncd /d "C:\\Riot Games\\League of Legends\\Game" & "League of Legends.exe" "spectator spectator.${spectatorRegion}.lol.riotgames.com:80 ${response.observers.encryptionKey} ${response.gameId} ${region.toUpperCase()}" "-UseRads"\n\`\`\``)))
							.catch((error) => message.channel.send(embed));
				})
				.catch((error) => {
					if (error.statusCode == 404) {
						return message.channel.send(new MessageEmbed()
								.setColor(message.client.colors.WARNING)
								.setDescription(`Summoner "${summonerNameQuery}" not found.`)
								.setTitle('Summoner Not Found')
						);
					} else {
						return message.channel.send(new MessageEmbed()
								.setColor(message.client.colors.ERROR)
								.setDescription(`There was an error while trying to access the Riot API. Please contact the bot author or report an issue.`)
								.setTitle('Error')
								.addField('Error Message', `${error}`)
								.addField('Support Server', message.client.urls.SUPPORT)
								.addField('Report an Issue', message.client.urls.ISSUE)
						);
					}
				});
	}
};
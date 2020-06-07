const discord = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const manager = new discord.ShardingManager('./bot.js', { token: process.env.TOKEN });

manager.spawn();
manager.on('shardCreate', shard => console.log(`New shard: ${shard.id}`));

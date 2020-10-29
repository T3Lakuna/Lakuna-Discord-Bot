const dotenv = require('dotenv');
const discord = require('discord.js');
const config = require('./config');
const log = require(`${config.LIB_DIR}log.js`);

// Load environment variables.
dotenv.config();

// Create sharding manager.
const shardingManager = new discord.ShardingManager(config.BOT_PATH, { token: process.env.TOKEN });

// Log to console whenever a shard is created.
shardingManager.on('shardCreate', (shard) => log.console(`Shard created with ID #${shard.id}.`));

// Spawn shards based on guild count.
shardingManager.spawn();

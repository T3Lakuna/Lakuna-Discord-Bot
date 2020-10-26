// Load libraries.
const discord = require('discord.js')
const dotenv = require('dotenv');
const config = require('./config.js');
const log = require(`${config.LIB_PATH}/log.js`);

// Load environment variables.
dotenv.config();

// Create sharding manager.
const shardingManager = new discord.ShardingManager(config.BOT_PATH, { token: process.env.TOKEN });

// Log to console whenever a shard is created.
shardingManager.on('shardCreate', (shard) => log.unified(log.types.INFO, null, `Shard created with ID: ${shard.id}`));

// Spawn shards based on guild count.
shardingManager.spawn();

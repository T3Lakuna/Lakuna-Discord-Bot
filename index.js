const discord = require('discord.js');
const dotenv = require('dotenv');
const express = require('express');

// Load environment variables.
dotenv.config();

// Bot (Sharding)
const manager = new discord.ShardingManager('./bot.js', { token: process.env.TOKEN });
manager.on('shardCreate', (shard) => console.log);
manager.spawn();

// Website
const port = 80;
const redirectHTML = (url) => `<meta http-equiv="Refresh" content="0; url=${url}" />`
const website = express();
website.get('/', (req, res) => res.send(redirectHTML(`https://top.gg/bot/${process.env.CLIENT_ID}`))); // Index
website.get('/r/issue', (req, res) => res.send(redirectHTML('https://github.com/T3Lakuna/Lakuna-Discord-Bot/issues'))); // Issues
website.get('/r/repository', (req, res) => res.send(redirectHTML('https://github.com/T3Lakuna/Lakuna-Discord-Bot'))); // Repository
website.get('/r/support', (req, res) => res.send(redirectHTML('https://lakuna.pw/r/discord'))); // Support Server
website.get('/r/website', (req, res) => res.send(redirectHTML('https://lakuna.pw'))); // Website
website.get('/riot.txt', (req, res) => res.send('45539fa7-792d-4d77-9002-e6f762ee082f')); // Riot Developer Authentication
website.listen(port, () => console.log(`Website lisening on port ${port}`));
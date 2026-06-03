const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const client = new Client({
 intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers]
});
client.once('ready',()=>console.log('Un-spam V2 Online'));
client.login(process.env.DISCORD_TOKEN);

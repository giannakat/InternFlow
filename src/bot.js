const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config');
const { handleButtons } = require('./handlers/buttons');
const { startScheduler } = require('./scheduler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  startScheduler(client);
});

// Listen for interactions (like button clicks)
client.on('interactionCreate', async interaction => {
  await handleButtons(interaction);
});

// Log in to Discord with your client's token and bot becomes online
client.login(token);

module.exports = client;
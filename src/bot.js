const { Client, GatewayIntentBits } = require('discord.js');
const { token, channelId } = require('./config');
const { handleButtons } = require('./handlers/buttons');
const { startScheduler } = require('./scheduler');
const { setState, getState } = require('./utils/state');


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

// Listen for messages in the channel to save work logs
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channelId !== channelId) return;

  const { timedIn } = getState();
  if (!timedIn) return;

  setState({ workLog: message.content });
  await message.reply('✅ Work log saved!');
});

// Log in to Discord with your client's token and bot becomes online
client.login(token);

module.exports = client;
require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  channelId: process.env.DISCORD_CHANNEL_ID,
  ojtEmail: process.env.OJT_EMAIL,
  ojtPassword: process.env.OJT_PASSWORD,
  ojtUrl: process.env.OJT_URL,
};
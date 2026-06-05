const cron = require('node-cron');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { channelId } = require('./config');

let responded = false;

function setResponded(value) {
  responded = value;
}

function startScheduler(client) {
  cron.schedule('57 4 * * *', async () => {
    const channel = await client.channels.fetch(channelId);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_timein')
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('cancel_timein')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger)
      );

    await channel.send({
      content: '⏰ OJT Time In Reminder\nAre you ready to time in?',
      components: [row]
    });

    setTimeout(() => {
      if (!responded) {
        channel.send('⏰ No response received. Running automatic Time In...');
        console.log('AUTO TIME IN TRIGGERED');
      }
    }, 30 * 1000);

  });
}

module.exports = { startScheduler, setResponded };
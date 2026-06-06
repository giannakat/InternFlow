const cron = require('node-cron');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { channelId } = require('./config');
const { isWorkday } = require('./utils/isWorkday');
const { timeIn } = require('./automation/ojt');

let responded = false;

function setResponded(value) {
  responded = value;
}

function startScheduler(client) {
  cron.schedule('43 4 * * *', async () => {
    if (!isWorkday()) {
      return;
    }

    responded = false;

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

    const reminderMessage = await channel.send({
      content: '⏰ OJT Time In Reminder\nAre you ready to time in?',
      components: [row]
    });

    setTimeout(async () => {
      if (!responded) {
        responded = true;

        const disabledRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('confirm_timein')
              .setLabel('Confirm')
              .setStyle(ButtonStyle.Success)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('cancel_timein')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          );

        await reminderMessage.edit({ components: [disabledRow] });
        await channel.send('⏰ No response received. Running automatic Time In...');

        try {
          const success = await timeIn();
          await channel.send(
            success
              ? '✅ Auto Time In successful!'
              : '❌ Auto Time In may have failed. Please check manually.'
          );
        } catch (err) {
          console.error('Auto Time In error:', err);
          await channel.send('❌ Auto Time In failed with an error. Please check manually.');
        }
      }
    }, 30 * 1000);

  });
}

module.exports = { startScheduler, setResponded };
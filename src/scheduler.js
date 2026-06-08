const cron = require('node-cron');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { channelId } = require('./config');
const { isWorkday } = require('./utils/isWorkday');
const { timeIn, timeOut } = require('./automation/ojt');
const { setState, getState, resetState } = require('./utils/state');

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
        setState({ timedIn: true, autoTimedIn: true });
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
          const { success, screenshotPath } = await timeIn();
          await channel.send({
            content: success
              ? '✅ Auto Time In successful!'
              : '❌ Auto Time In may have failed. Please check manually.',
            files: screenshotPath ? [screenshotPath] : []
          });
        } catch (err) {
          console.error('Auto Time In error:', err);
          await channel.send('❌ Auto Time In failed with an error. Please check manually.');
        }
      }
    }, 30 * 1000);

  });
// 4:50 AM - Work log collection
cron.schedule('56 13 * * *', async () => {
  const { timedIn } = getState();
  if (!timedIn) {
    console.log('Not timed in today. Skipping work log prompt.');
    return;
  }

  const channel = await client.channels.fetch(channelId);
  await channel.send('📝 What did you work on today? Reply with your work summary.');
});

// 5:00 AM - Time Out prompt
cron.schedule('57 13 * * *', async () => {
  const { timedIn, autoTimedIn, workLog } = getState();
  if (!timedIn) {
    console.log('Not timed in today. Skipping Time Out.');
    return;
  }

  const channel = await client.channels.fetch(channelId);
  const log = workLog || 'Completed OJT tasks for the day.';

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_timeout')
        .setLabel('Time Out')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('cancel_timeout')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );

  const timeOutMessage = await channel.send({
    content: `🕔 OJT Time Out\n\n📝 Work log:\n${log}\n\nReady to Time Out?`,
    components: [row]
  });

  if (autoTimedIn) {
    await channel.send('⏰ Auto Time In was used today. Auto Time Out will trigger in 10 minutes if no response.');
  }

  setTimeout(async () => {
    if (!getState().timeOutResponded) {
      setState({ timeOutResponded: true });
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_timeout')
            .setLabel('Time Out')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('cancel_timeout')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

      await timeOutMessage.edit({ components: [disabledRow] });
      await channel.send('⏰ No response received. Running automatic Time Out...');

      try {
        const { success, screenshotPath } = await timeOut(log);
        await channel.send({
          content: success
            ? '✅ Auto Time Out successful!'
            : '❌ Auto Time Out may have failed. Please check manually.',
          files: screenshotPath ? [screenshotPath] : []
        });
        resetState();
      } catch (err) {
        console.error('Auto Time Out error:', err);
        await channel.send('❌ Auto Time Out failed. Please check manually.');
      }
    }
  }, 10 * 60 * 1000);
});


}

module.exports = { startScheduler, setResponded };
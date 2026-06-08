const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { setResponded } = require('../scheduler');
const { timeIn, timeOut } = require('../automation/ojt');
const { setState, resetState } = require('../utils/state');

async function handleButtons(interaction) {
  if (!interaction.isButton()) return;

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

  if (interaction.customId === 'confirm_timein') {
    setResponded(true);
    setState({ timedIn: true, autoTimedIn: false });
    await interaction.message.edit({ components: [disabledRow] });
    await interaction.reply({
      content: '✅ Time In confirmed. Running automation...',
      flags: MessageFlags.Ephemeral
    });

    console.log('RUN TIME IN AUTOMATION');

   try {
      const { success, screenshotPath } = await timeIn();
      await interaction.channel.send({
        content: success
          ? '✅ Time In successful!'
          : '❌ Time In may have failed. Please check manually.',
        files: screenshotPath ? [screenshotPath] : []
      });
    } catch (err) {
      console.error('Time In error:', err);
      await interaction.channel.send('❌ Time In failed with an error. Please check manually.');
    }
  }

  if (interaction.customId === 'cancel_timein') {
    setResponded(true);
    await interaction.message.edit({ components: [disabledRow] });
    await interaction.reply({
      content: '❌ Time In cancelled.',
      flags: MessageFlags.Ephemeral
    });
    console.log('CANCELLED');
  }

  if (interaction.customId === 'confirm_timeout') {
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

  setState({ timeOutResponded: true });
  await interaction.message.edit({ components: [disabledRow] });
  await interaction.reply({
    content: '⏳ Running Time Out automation...',
    flags: MessageFlags.Ephemeral
  });

  try {
    const { timedIn, workLog } = getState();
    const log = workLog || 'Completed OJT tasks for the day.';
    const { success, screenshotPath } = await timeOut(log);
    await interaction.channel.send({
      content: success
        ? '✅ Time Out successful!'
        : '❌ Time Out may have failed. Please check manually.',
      files: screenshotPath ? [screenshotPath] : []
    });
    resetState();
  } catch (err) {
    console.error('Time Out error:', err);
    await interaction.channel.send('❌ Time Out failed with an error. Please check manually.');
  }
}

  if (interaction.customId === 'cancel_timeout') {
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

    await interaction.message.edit({ components: [disabledRow] });
    await interaction.reply({
      content: '❌ Time Out cancelled.',
      flags: MessageFlags.Ephemeral
    });
  }
}

module.exports = { handleButtons };
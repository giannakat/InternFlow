const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { setResponded } = require('../scheduler');
const { timeIn } = require('../automation/ojt');

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
    await interaction.message.edit({ components: [disabledRow] });
    await interaction.reply({
      content: '✅ Time In confirmed. Running automation...',
      flags: MessageFlags.Ephemeral
    });

    console.log('RUN TIME IN AUTOMATION');

   try {
      const success = await timeIn();
      await interaction.channel.send(
        success
          ? '✅ Time In successful!'
          : '❌ Time In may have failed. Please check manually.'
      );
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
}

module.exports = { handleButtons };
async function handleButtons(interaction) {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'confirm_timein') {
    setResponded(true);
    await interaction.reply({
      content: '✅ Time In confirmed. Running automation...',
      ephemeral: true
    });
    
    console.log('RUN TIME IN AUTOMATION');
  }

  if (interaction.customId === 'cancel_timein') {
    await interaction.reply({
      content: '❌ Time In cancelled.',
      ephemeral: true
    });

    console.log('CANCELLED');
  }
}

module.exports = { handleButtons };
/**
 * Music Module - Skip Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { createSuccessEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),
  async execute(interaction) {
    // Stub implementation
    await interaction.reply({
      embeds: [createSuccessEmbed(
        '⏭️ Skipped',
        'Skip feature coming soon!',
      )],
      ephemeral: true,
    });
  },
};

/**
 * Music Module - Queue Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the current music queue'),
  async execute(interaction) {
    // Stub implementation
    await interaction.reply({
      embeds: [createEmbed({
        title: '🎵 Queue',
        description: 'Queue feature coming soon!',
      })],
      ephemeral: true,
    });
  },
};

/**
 * Music Module - Play Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube or Spotify')
    .addStringOption((option) => option.setName('query').setDescription('Song name or URL').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query');
    const member = interaction.member;

    // Check if user is in voice
    if (!member.voice.channel) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Not in Voice',
          'You must be in a voice channel to use music commands.',
        )],
      });
      return;
    }

    try {
      // This is a stub - implement with discord-player
      await interaction.editReply({
        embeds: [createSuccessEmbed(
          '🎵 Now Playing',
          `Queued: **${query}**\nThis feature is coming soon!`,
        )],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', error.message)],
      });
    }
  },
};

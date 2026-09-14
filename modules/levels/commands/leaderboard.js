/**
 * Levels Module - Leaderboard Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { getLeaderboard } from '../../core/database.js';
import { createEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard'),
  async execute(interaction) {
    await interaction.deferReply();

    const leaderboard = getLeaderboard(interaction.guildId, 15);

    if (leaderboard.length === 0) {
      await interaction.editReply({
        embeds: [createEmbed({
          title: '📊 Leaderboard',
          description: 'No one has earned XP yet. Start chatting to climb the ranks!',
        })],
      });
      return;
    }

    const fields = leaderboard.map((user, index) => ({
      name: `${index + 1}. <@${user.user_id}>`,
      value: `**XP:** ${user.xp} | **Level:** ${user.level}`,
      inline: false,
    }));

    await interaction.editReply({
      embeds: [createEmbed({
        title: '📊 Server Leaderboard',
        fields,
      })],
    });
  },
};

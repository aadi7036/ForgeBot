/**
 * Levels Module - Rank Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { getUser, getLeaderboard } from '../../core/database.js';
import { createEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your current rank and XP')
    .addUserOption((option) => option.setName('user').setDescription('User to check (default: yourself)')),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = getUser(targetUser.id, interaction.guildId);

    if (!userData) {
      await interaction.reply({
        embeds: [createEmbed({
          title: '📊 Rank',
          description: `${targetUser.username} hasn't earned any XP yet.`,
        })],
        ephemeral: true,
      });
      return;
    }

    const leaderboard = getLeaderboard(interaction.guildId, 1000);
    const rank = leaderboard.findIndex((u) => u.user_id === targetUser.id) + 1;

    const xpToNextLevel = (userData.level + 1) * 100;
    const progressPercent = Math.floor((userData.xp / xpToNextLevel) * 100);
    const progressBar = '█'.repeat(Math.floor(progressPercent / 5)) + '░'.repeat(20 - Math.floor(progressPercent / 5));

    await interaction.reply({
      embeds: [createEmbed({
        title: '📊 Your Rank',
        fields: [
          { name: 'User', value: targetUser.username, inline: true },
          { name: 'Level', value: userData.level.toString(), inline: true },
          { name: 'Rank', value: `#${rank}`, inline: true },
          { name: 'XP', value: `${userData.xp} / ${xpToNextLevel}`, inline: false },
          { name: 'Progress', value: `${progressBar} ${progressPercent}%`, inline: false },
        ],
      })],
      ephemeral: true,
    });
  },
};

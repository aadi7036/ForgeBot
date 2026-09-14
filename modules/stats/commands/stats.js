/**
 * Stats Module - User Stats Command (Extensible)
 */

import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, createErrorEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Look up user stats (extensible for multiple games)')
    .addStringOption((option) => option.setName('game').setDescription('Game name').setRequired(true))
    .addStringOption((option) => option.setName('username').setDescription('Username to lookup').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();

    const game = interaction.options.getString('game').toLowerCase();
    const username = interaction.options.getString('username');

    // This is a stub - extend with real API calls
    const mockStats = {
      valorant: {
        rank: 'Platinum 3',
        rr: 75,
        wins: 234,
        kd: 1.28,
      },
      csgo: {
        rank: 'LEM',
        wins: 567,
        kd: 1.15,
        hs: '62%',
      },
    };

    const stats = mockStats[game];

    if (!stats) {
      await interaction.editReply({
        embeds: [createErrorEmbed(
          'Game Not Found',
          `Stats for **${game}** are not yet available. Supported games: valorant, csgo`,
        )],
      });
      return;
    }

    const fields = Object.entries(stats).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value.toString(),
      inline: true,
    }));

    await interaction.editReply({
      embeds: [createEmbed({
        title: `📊 ${username}'s ${game.toUpperCase()} Stats`,
        fields,
      })],
    });
  },
};

/**
 * Moderation Module - Warnings Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { getUserModerationLog } from '../../core/database.js';
import { createEmbed, createErrorEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View a user\'s warnings')
    .addUserOption((option) => option.setName('user').setDescription('User to check').setRequired(true)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const log = getUserModerationLog(interaction.guildId, targetUser.id);

    if (log.length === 0) {
      await interaction.reply({
        embeds: [createEmbed({
          title: '✅ Clean Record',
          description: `**${targetUser.username}** has no warnings.`,
        })],
        ephemeral: true,
      });
      return;
    }

    const fields = log
      .filter((entry) => entry.action === 'warn')
      .slice(0, 10)
      .map((entry, idx) => ({
        name: `Warning #${idx + 1}`,
        value: `**Reason:** ${entry.reason}\n**Moderator:** <@${entry.moderator_id}>\n**Date:** <t:${Math.floor(new Date(entry.created_at).getTime() / 1000)}:R>`,
        inline: false,
      }));

    await interaction.reply({
      embeds: [createEmbed({
        title: `⚠️ ${targetUser.username}'s Warnings`,
        fields: fields.length > 0 ? fields : [{ name: 'No warnings found', value: 'This user has a clean record.' }],
      })],
      ephemeral: true,
    });
  },
};

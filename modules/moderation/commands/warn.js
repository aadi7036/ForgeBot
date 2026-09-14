/**
 * Moderation Module - Warn Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { getUser, setUser, logModerationAction, getUserModerationLog } from '../../core/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption((option) => option.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for warning')),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
      await interaction.reply({
        embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to warn users.')],
        ephemeral: true,
      });
      return;
    }

    const userData = getUser(targetUser.id, interaction.guildId) || {};
    const newWarnings = (userData.warnings || 0) + 1;

    setUser(targetUser.id, interaction.guildId, { warnings: newWarnings });
    logModerationAction(
      interaction.guildId,
      'warn',
      interaction.user.id,
      targetUser.id,
      reason,
    );

    await interaction.reply({
      embeds: [createSuccessEmbed(
        '⚠️ User Warned',
        `**${targetUser.username}** has been warned (${newWarnings} total).\n**Reason:** ${reason}`,
      )],
    });
  },
};

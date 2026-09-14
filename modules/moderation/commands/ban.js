/**
 * Moderation Module - Ban Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { logModerationAction } from '../../core/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for ban')),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      await interaction.reply({
        embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to ban users.')],
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.guild.bans.create(targetUser.id, { reason });

      logModerationAction(
        interaction.guildId,
        'ban',
        interaction.user.id,
        targetUser.id,
        reason,
      );

      await interaction.reply({
        embeds: [createSuccessEmbed(
          '🔨 User Banned',
          `**${targetUser.username}** has been banned.\n**Reason:** ${reason}`,
        )],
      });
    } catch (error) {
      await interaction.reply({
        embeds: [createErrorEmbed('Error', error.message)],
        ephemeral: true,
      });
    }
  },
};

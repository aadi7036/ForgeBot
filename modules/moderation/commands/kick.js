/**
 * Moderation Module - Kick Command
 */

import { SlashCommandBuilder } from 'discord.js';
import { logModerationAction } from '../../core/database.js';
import { createSuccessEmbed, createErrorEmbed } from '../../core/themes.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) => option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for kick')),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has('KICK_MEMBERS')) {
      await interaction.reply({
        embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to kick users.')],
        ephemeral: true,
      });
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(targetUser.id);
      await member.kick(reason);

      logModerationAction(
        interaction.guildId,
        'kick',
        interaction.user.id,
        targetUser.id,
        reason,
      );

      await interaction.reply({
        embeds: [createSuccessEmbed(
          '👢 User Kicked',
          `**${targetUser.username}** has been kicked.\n**Reason:** ${reason}`,
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

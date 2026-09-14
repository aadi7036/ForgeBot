/**
 * ForgeBot Permission & Rate-Limit Layer
 * Centralized permission checks and rate limiting for all modules
 */

import { isModuleEnabled } from './database.js';
import { createErrorEmbed } from './themes.js';

const RATE_LIMITS = new Map(); // userId -> { command -> { count, resetTime } }

/**
 * Check if user has permission to run command
 * @param {Interaction} interaction - Discord interaction
 * @param {Array<string>} requiredPermissions - Required Discord permissions
 * @returns {boolean}
 */
function checkPermissions(interaction, requiredPermissions = []) {
  // Bot owner bypass
  if (interaction.user.id === process.env.BOT_OWNER_ID) {
    return true;
  }

  // Check Discord permissions
  if (requiredPermissions.length > 0 && interaction.inGuild()) {
    const memberPerms = interaction.member.permissions;
    const missing = requiredPermissions.filter((perm) => !memberPerms.has(perm));
    if (missing.length > 0) {
      return false;
    }
  }

  return true;
}

/**
 * Check if user is rate-limited
 * @param {string} userId - Discord user ID
 * @param {string} commandName - Command name
 * @param {number} limit - Max uses per minute
 * @returns {boolean} true if rate-limited
 */
function isRateLimited(userId, commandName, limit = 5) {
  if (!RATE_LIMITS.has(userId)) {
    RATE_LIMITS.set(userId, {});
  }

  const userLimits = RATE_LIMITS.get(userId);
  const now = Date.now();
  const minute = 60 * 1000;

  if (!userLimits[commandName]) {
    userLimits[commandName] = { count: 1, resetTime: now + minute };
    return false;
  }

  const data = userLimits[commandName];

  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + minute;
    return false;
  }

  data.count += 1;
  return data.count > limit;
}

/**
 * Get remaining rate limit
 */
function getRateLimitRemaining(userId, commandName, limit = 5) {
  if (!RATE_LIMITS.has(userId)) return limit;
  const data = RATE_LIMITS.get(userId)[commandName];
  if (!data || Date.now() > data.resetTime) return limit;
  return Math.max(0, limit - data.count);
}

/**
 * Middleware: Verify module is enabled and user has permission
 */
async function moduleGuard(interaction, moduleName, requiredPermissions = []) {
  // Check if module is enabled
  if (!isModuleEnabled(interaction.guildId, moduleName)) {
    return {
      allowed: false,
      error: `Module \`${moduleName}\` is not enabled in this server. Admins can enable it via /forge modules`,
    };
  }

  // Check permissions
  if (!checkPermissions(interaction, requiredPermissions)) {
    return {
      allowed: false,
      error: `You do not have permission to use this command. Required: ${requiredPermissions.join(', ')}`,
    };
  }

  // Check rate limit
  if (isRateLimited(interaction.user.id, `${moduleName}:${interaction.commandName}`, 5)) {
    const remaining = getRateLimitRemaining(interaction.user.id, `${moduleName}:${interaction.commandName}`, 5);
    return {
      allowed: false,
      error: `You're using this command too fast! Try again in a moment. (${remaining}/5 uses per minute)`,
    };
  }

  return { allowed: true };
}

/**
 * Safely execute a module command with error handling
 */
async function executeCommand(interaction, moduleName, handler, requiredPermissions = []) {
  try {
    const guard = await moduleGuard(interaction, moduleName, requiredPermissions);
    if (!guard.allowed) {
      await interaction.reply({
        embeds: [createErrorEmbed('Permission Denied', guard.error)],
        ephemeral: true,
      });
      return;
    }

    await handler(interaction);
  } catch (error) {
    console.error(`[${moduleName}] Command error:`, error);
    try {
      const errorEmbed = createErrorEmbed(
        'An error occurred',
        `\`\`\`${error.message}\`\`\``,
      );
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (replyError) {
      console.error('Failed to send error message:', replyError);
    }
  }
}

export {
  checkPermissions,
  isRateLimited,
  getRateLimitRemaining,
  moduleGuard,
  executeCommand,
};

/**
 * Levels Module - Message XP Gain Event
 */

import { getUser, setUser, addXP } from '../../core/database.js';

export default {
  name: 'messageCreate',
  async execute(message) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;

    // Award 1-3 XP randomly
    const xpGain = Math.floor(Math.random() * 3) + 1;
    const userData = getUser(message.author.id, message.guild.id);

    if (!userData) {
      setUser(message.author.id, message.guild.id, { xp: xpGain });
    } else {
      addXP(message.author.id, message.guild.id, xpGain);

      // Check for level up
      const updated = getUser(message.author.id, message.guild.id);
      const oldLevel = userData.level;
      const newLevel = Math.floor(updated.xp / 100);

      if (newLevel > oldLevel) {
        setUser(message.author.id, message.guild.id, { level: newLevel });
        message.reply({
          content: `🎉 **${message.author.username}** reached **Level ${newLevel}**!`,
        }).catch(() => {});
      }
    }
  },
};

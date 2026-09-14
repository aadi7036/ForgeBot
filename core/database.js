/**
 * ForgeBot Database Layer
 * SQLite-based per-guild configuration and persistent data
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = './data/forgebot.db';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

/**
 * Initialize all database tables
 */
function initDatabase() {
  // Guild settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      modules_enabled TEXT NOT NULL DEFAULT '{}',
      module_config TEXT NOT NULL DEFAULT '{}',
      prefix TEXT DEFAULT '!',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table (for XP, warnings, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      warnings INTEGER DEFAULT 0,
      mute_until DATETIME,
      last_message DATETIME,
      PRIMARY KEY (user_id, guild_id),
      FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
    )
  `);

  // Moderation log
  db.exec(`
    CREATE TABLE IF NOT EXISTS moderation_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      action TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT,
      duration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guild_id) REFERENCES guild_settings(guild_id)
    )
  `);
}

/**
 * Get guild settings, creating defaults if needed
 */
function getGuildSettings(guildId) {
  let settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);

  if (!settings) {
    db.prepare(`
      INSERT INTO guild_settings (guild_id, modules_enabled, module_config)
      VALUES (?, ?, ?)
    `).run(guildId, '{}', '{}');
    settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  }

  return {
    ...settings,
    modules_enabled: JSON.parse(settings.modules_enabled || '{}'),
    module_config: JSON.parse(settings.module_config || '{}'),
  };
}

/**
 * Update guild settings
 */
function updateGuildSettings(guildId, updates) {
  const current = getGuildSettings(guildId);
  const modulesEnabled = { ...current.modules_enabled, ...updates.modules_enabled };
  const moduleConfig = { ...current.module_config, ...updates.module_config };

  db.prepare(`
    UPDATE guild_settings
    SET modules_enabled = ?, module_config = ?, updated_at = CURRENT_TIMESTAMP
    WHERE guild_id = ?
  `).run(
    JSON.stringify(modulesEnabled),
    JSON.stringify(moduleConfig),
    guildId,
  );
}

/**
 * Enable/disable a module for a guild
 */
function setModuleEnabled(guildId, moduleName, enabled) {
  const settings = getGuildSettings(guildId);
  settings.modules_enabled[moduleName] = enabled;
  updateGuildSettings(guildId, { modules_enabled: settings.modules_enabled });
}

/**
 * Check if module is enabled for guild
 */
function isModuleEnabled(guildId, moduleName) {
  const settings = getGuildSettings(guildId);
  return settings.modules_enabled[moduleName] !== false; // Default to enabled
}

/**
 * Get user data
 */
function getUser(userId, guildId) {
  return db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(userId, guildId) || null;
}

/**
 * Create or update user
 */
function setUser(userId, guildId, data) {
  const existing = getUser(userId, guildId);
  if (existing) {
    const updates = Object.entries(data)
      .map(([k]) => `${k} = ?`)
      .join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE users SET ${updates} WHERE user_id = ? AND guild_id = ?`)
      .run(...values, userId, guildId);
  } else {
    db.prepare(`
      INSERT INTO users (user_id, guild_id, ${Object.keys(data).join(', ')})
      VALUES (?, ?, ${Object.keys(data).map(() => '?').join(', ')})
    `).run(userId, guildId, ...Object.values(data));
  }
}

/**
 * Add XP to user
 */
function addXP(userId, guildId, amount) {
  const user = getUser(userId, guildId);
  if (!user) {
    setUser(userId, guildId, { xp: amount });
  } else {
    db.prepare('UPDATE users SET xp = xp + ? WHERE user_id = ? AND guild_id = ?')
      .run(amount, userId, guildId);
  }
}

/**
 * Get leaderboard
 */
function getLeaderboard(guildId, limit = 10) {
  return db.prepare(`
    SELECT user_id, xp, level
    FROM users
    WHERE guild_id = ?
    ORDER BY xp DESC
    LIMIT ?
  `).all(guildId, limit);
}

/**
 * Log moderation action
 */
function logModerationAction(guildId, action, moderatorId, targetId, reason, duration) {
  db.prepare(`
    INSERT INTO moderation_log (guild_id, action, moderator_id, target_id, reason, duration)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(guildId, action, moderatorId, targetId, reason, duration);
}

/**
 * Get moderation log for user
 */
function getUserModerationLog(guildId, userId, limit = 10) {
  return db.prepare(`
    SELECT *
    FROM moderation_log
    WHERE guild_id = ? AND target_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(guildId, userId, limit);
}

export {
  db,
  initDatabase,
  getGuildSettings,
  updateGuildSettings,
  setModuleEnabled,
  isModuleEnabled,
  getUser,
  setUser,
  addXP,
  getLeaderboard,
  logModerationAction,
  getUserModerationLog,
};

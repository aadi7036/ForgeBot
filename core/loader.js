/**
 * ForgeBot Plugin Loader
 * Dynamically loads modules from /modules directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from 'discord.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = path.join(__dirname, '../modules');

const loadedModules = new Map();
const moduleCommands = new Map();
const moduleEvents = new Map();

/**
 * Validate module manifest
 */
function validateManifest(manifest, moduleName) {
  const required = ['name', 'description', 'version', 'author'];
  const missing = required.filter((field) => !manifest[field]);
  if (missing.length > 0) {
    throw new Error(`Module ${moduleName}: Missing manifest fields: ${missing.join(', ')}`);
  }
}

/**
 * Load a single module
 */
async function loadModule(moduleName) {
  const modulePath = path.join(MODULES_DIR, moduleName);
  const manifestPath = path.join(modulePath, 'manifest.json');

  // Validate manifest exists
  if (!fs.existsSync(manifestPath)) {
    console.warn(`⚠️  Module ${moduleName}: manifest.json not found, skipping`);
    return null;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    validateManifest(manifest, moduleName);

    // Load commands
    const commands = [];
    const commandsDir = path.join(modulePath, 'commands');
    if (fs.existsSync(commandsDir)) {
      const commandFiles = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'));
      for (const file of commandFiles) {
        const commandPath = path.join(commandsDir, file);
        const { default: command } = await import(`file://${commandPath}`);
        if (command.data) {
          commands.push(command);
        }
      }
    }

    // Load events
    const events = [];
    const eventsDir = path.join(modulePath, 'events');
    if (fs.existsSync(eventsDir)) {
      const eventFiles = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.js'));
      for (const file of eventFiles) {
        const eventPath = path.join(eventsDir, file);
        const { default: event } = await import(`file://${eventPath}`);
        if (event.name && event.execute) {
          events.push(event);
        }
      }
    }

    const moduleData = {
      name: manifest.name,
      manifest,
      commands,
      events,
      path: modulePath,
    };

    loadedModules.set(moduleName, moduleData);
    moduleCommands.set(moduleName, commands);
    moduleEvents.set(moduleName, events);

    console.log(`✅ Loaded module: ${moduleName} (${commands.length} commands, ${events.length} events)`);
    return moduleData;
  } catch (error) {
    console.error(`❌ Failed to load module ${moduleName}:`, error.message);
    return null;
  }
}

/**
 * Load all modules from /modules directory
 */
async function loadAllModules() {
  if (!fs.existsSync(MODULES_DIR)) {
    console.warn('⚠️  /modules directory not found');
    return [];
  }

  const moduleNames = fs.readdirSync(MODULES_DIR)
    .filter((f) => fs.statSync(path.join(MODULES_DIR, f)).isDirectory());

  console.log(`\n📦 Loading ${moduleNames.length} modules...`);

  const loaded = [];
  for (const moduleName of moduleNames) {
    const module = await loadModule(moduleName);
    if (module) loaded.push(module);
  }

  console.log(`\n✨ Loaded ${loaded.length}/${moduleNames.length} modules\n`);
  return loaded;
}

/**
 * Register all slash commands with Discord
 */
async function registerSlashCommands(client) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    const commands = [];
    for (const [moduleName, moduleCommands_] of moduleCommands) {
      for (const cmd of moduleCommands_) {
        if (cmd.data) {
          commands.push(cmd.data.toJSON());
        }
      }
    }

    // Add core Forge commands
    commands.push(
      {
        name: 'forge',
        description: 'ForgeBot management commands',
        type: 1,
        options: [
          {
            name: 'modules',
            description: 'Manage modules for this server',
            type: 1,
          },
          {
            name: 'reload',
            description: 'Reload all modules (bot owner only)',
            type: 1,
          },
          {
            name: 'status',
            description: 'View bot status and loaded modules',
            type: 1,
          },
        ],
      },
    );

    console.log(`📤 Registering ${commands.length} slash commands...`);

    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log(`✅ Registered commands in test guild ${process.env.GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log('✅ Registered commands globally (may take up to 1 hour)');
    }
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
}

/**
 * Register event listeners from all modules
 */
function registerEventListeners(client) {
  for (const [moduleName, events] of moduleEvents) {
    for (const event of events) {
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
  console.log('📡 Event listeners registered');
}

/**
 * Get all loaded modules
 */
function getLoadedModules() {
  return Array.from(loadedModules.values());
}

/**
 * Get module by name
 */
function getModule(moduleName) {
  return loadedModules.get(moduleName);
}

export {
  loadAllModules,
  loadModule,
  registerSlashCommands,
  registerEventListeners,
  getLoadedModules,
  getModule,
};

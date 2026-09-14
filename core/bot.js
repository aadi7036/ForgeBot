/**
 * ForgeBot Main Entry Point
 * Initializes Discord client, loads modules, and sets up event handlers
 */

import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import { loadAllModules, registerSlashCommands, registerEventListeners, getLoadedModules, getModule } from './loader.js';
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed } from './themes.js';
import { isModuleEnabled, getGuildSettings, setModuleEnabled } from './database.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Initialize database
initDatabase();

/**
 * Handle slash command interactions
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, guildId, user } = interaction;

  try {
    // Handle core "forge" commands
    if (commandName === 'forge') {
      const subcommand = options.getSubcommand();

      if (subcommand === 'modules') {
        await handleModulesCommand(interaction);
      } else if (subcommand === 'reload') {
        await handleReloadCommand(interaction);
      } else if (subcommand === 'status') {
        await handleStatusCommand(interaction);
      }
      return;
    }

    // Route to module commands
    for (const module of getLoadedModules()) {
      for (const command of module.commands) {
        if (command.data.name === commandName) {
          // Check if module is enabled
          if (!isModuleEnabled(guildId, module.name)) {
            await interaction.reply({
              embeds: [createErrorEmbed(
                'Module Disabled',
                `The \`${module.name}\` module is not enabled in this server.\nAsk an admin to enable it via \`/forge modules\``,
              )],
              ephemeral: true,
            });
            return;
          }

          // Execute command
          await command.execute(interaction);
          return;
        }
      }
    }

    console.warn(`Unknown command: ${commandName}`);
  } catch (error) {
    console.error('Command error:', error);
    const errorMsg = createErrorEmbed('Error', `\`\`\`${error.message}\`\`\``);
    if (interaction.replied) {
      await interaction.editReply({ embeds: [errorMsg] });
    } else {
      await interaction.reply({ embeds: [errorMsg], ephemeral: true });
    }
  }
});

/**
 * Handle button interactions
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user, guildId } = interaction;

  try {
    // Module toggle buttons
    if (customId.startsWith('toggle_module_')) {
      const moduleName = customId.replace('toggle_module_', '');
      const settings = getGuildSettings(guildId);
      const enabled = !settings.modules_enabled[moduleName];

      setModuleEnabled(guildId, moduleName, enabled);

      await interaction.reply({
        embeds: [createSuccessEmbed(
          `Module ${enabled ? 'Enabled' : 'Disabled'}`,
          `The \`${moduleName}\` module is now **${enabled ? 'enabled' : 'disabled'}** in this server.`,
        )],
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Button interaction error:', error);
    await interaction.reply({
      embeds: [createErrorEmbed('Error', error.message)],
      ephemeral: true,
    });
  }
});

/**
 * /forge modules - Module management panel
 */
async function handleModulesCommand(interaction) {
  const { guildId, member } = interaction;

  // Check if user is admin
  if (!member.permissions.has('MANAGE_GUILD')) {
    await interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only server admins can manage modules.')],
      ephemeral: true,
    });
    return;
  }

  const settings = getGuildSettings(guildId);
  const modules = getLoadedModules();

  const fields = modules.map((mod) => {
    const enabled = settings.modules_enabled[mod.name] !== false;
    return {
      name: `${enabled ? '✅' : '❌'} ${mod.name}`,
      value: mod.manifest.description,
      inline: false,
    };
  });

  const embed = {
    title: '⚙️ Module Management',
    description: 'Click buttons below to enable/disable modules for this server',
    fields,
    color: parseInt('FFD700'.replace('#', ''), 16),
    footer: { text: 'ForgeBot' },
    timestamp: new Date().toISOString(),
  };

  const components = [];
  for (let i = 0; i < modules.length; i += 5) {
    const row = {
      type: 1,
      components: modules.slice(i, i + 5).map((mod) => {
        const enabled = settings.modules_enabled[mod.name] !== false;
        return {
          type: 2,
          label: mod.name,
          custom_id: `toggle_module_${mod.name}`,
          style: enabled ? 3 : 4, // Green if enabled, Red if disabled
        };
      }),
    };
    components.push(row);
  }

  await interaction.reply({
    embeds: [embed],
    components,
    ephemeral: true,
  });
}

/**
 * /forge reload - Reload all modules (bot owner only)
 */
async function handleReloadCommand(interaction) {
  if (interaction.user.id !== process.env.BOT_OWNER_ID) {
    await interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only the bot owner can reload modules.')],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    console.log('Reloading modules...');
    const modules = await loadAllModules();
    await registerSlashCommands(client);

    await interaction.editReply({
      embeds: [createSuccessEmbed(
        'Modules Reloaded',
        `Loaded ${modules.length} modules and registered slash commands.`,
      )],
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Reload Failed', error.message)],
    });
  }
}

/**
 * /forge status - View bot status
 */
async function handleStatusCommand(interaction) {
  const modules = getLoadedModules();
  const uptime = Math.floor(client.uptime / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  const embed = {
    title: '📊 ForgeBot Status',
    fields: [
      { name: 'Loaded Modules', value: modules.length.toString(), inline: true },
      { name: 'Total Commands', value: modules.reduce((sum, m) => sum + m.commands.length, 0).toString(), inline: true },
      { name: 'Uptime', value: `${hours}h ${minutes}m`, inline: true },
      { name: 'Modules', value: modules.map((m) => `• **${m.name}** - ${m.commands.length} commands`).join('\n'), inline: false },
    ],
    color: parseInt('FFD700'.replace('#', ''), 16),
    footer: { text: 'ForgeBot' },
    timestamp: new Date().toISOString(),
  };

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

/**
 * Ready event - Bot is online
 */
client.once('ready', async () => {
  console.log(`
✅ ForgeBot online as ${client.user.tag}
`);
  client.user.setActivity('🔨 /forge modules', { type: 'LISTENING' });
});

/**
 * Guild create event - New guild joined
 */
client.on('guildCreate', (guild) => {
  console.log(`✅ Joined guild: ${guild.name} (${guild.id})`);
});

/**
 * Main startup
 */
async function start() {
  console.log('\n🚀 Starting ForgeBot...\n');

  // Load modules
  const modules = await loadAllModules();
  if (modules.length === 0) {
    console.warn('⚠️  No modules loaded. The bot will still work but have no features.');
  }

  // Login
  await client.login(process.env.DISCORD_TOKEN);

  // Register slash commands after login
  await registerSlashCommands(client);

  // Register event listeners
  registerEventListeners(client);
}

start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n
Shutting down gracefully...');
  await client.destroy();
  process.exit(0);
});

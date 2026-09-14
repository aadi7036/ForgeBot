# ForgeBot

A **modular, plugin-based Discord bot framework** built with discord.js v14 and Node.js. ForgeBot makes it easy to build, share, and manage Discord bot features as self-contained modules — no core code changes needed.

## Why ForgeBot?

- **Truly Modular**: Drop a new folder in `/modules`, and your feature is loaded automatically at startup.
- **Guild-Per-Guild Config**: Each server independently enables/disables modules and customizes settings.
- **Developer-Friendly**: Scaffold new modules in seconds with `npm run create-module`. Clear contributing guide and auto-generated module docs.
- **Production-Ready**: Built-in permission layers, rate limiting, logging, and SQLite config storage.
- **Branded & Polished**: Consistent dark navy + gold design across all embeds and interactions.

## Quick Start

### Prerequisites
- Node.js 18+
- A Discord bot token ([Create an app](https://discord.com/developers/applications))

### Installation

```bash
git clone https://github.com/aadi7036/ForgeBot.git
cd ForgeBot
npm install
cp .env.example .env
# Edit .env with your bot token and client ID
npm start
```

### Create Your First Module

```bash
npm run create-module my-awesome-module
```

This scaffolds a full module folder with commands, events, and manifest. Edit `modules/my-awesome-module/` and restart the bot.

## Project Structure

```
ForgeBot/
├── core/
│   ├── bot.js                 # Main bot initialization
│   ├── loader.js              # Plugin loader system
│   ├── database.js            # SQLite config & guild settings
│   ├── permissions.js         # Permission & rate-limit layer
│   └── themes.js              # Branding (colors, embeds)
├── modules/
│   ├── stats/                 # Game stats lookup module
│   ├── music/                 # Voice music playback
│   ├── moderation/            # Kick, ban, mute, warn
│   └── levels/                # XP & leveling system
├── config/
│   ├── default-config.json    # Default per-guild settings
│   └── permissions.json       # Permission matrix
├── scripts/
│   ├── create-module.js       # Module scaffolding CLI
│   └── validate-modules.js    # Manifest validation
├── .github/workflows/
│   └── validate-modules.yml   # PR validation workflow
├── README.md
├── CONTRIBUTING.md
├── MODULES.md                 # Auto-generated module docs
├── LICENSE
├── .env.example
└── package.json
```

## Available Modules

See [MODULES.md](./MODULES.md) for the full module catalog with descriptions, commands, and configuration options.

### Built-in Modules

- **stats** — Look up game stats from multiple providers (extensible)
- **music** — Queue, filters, DMCA-safe playback via discord-player
- **moderation** — Kick, ban, mute, warn with audit logging
- **levels** — XP tracking, leveling, and leaderboards

## Management

### Enable/Disable Modules Per Guild

```
/forge modules
```

Opens an interactive menu to enable/disable modules and view settings specific to your server.

### Forge Admin Commands

- `/forge modules` — Module management panel (server admins)
- `/forge reload` — Reload all modules (bot owner only)
- `/forge status` — View loaded modules and bot health

## Module Development

### Adding a New Module

1. **Scaffold the module:**
   ```bash
   npm run create-module payment-processor
   ```

2. **Edit `/modules/payment-processor/manifest.json`:**
   ```json
   {
     "name": "payment-processor",
     "description": "Process payments and track transactions",
     "version": "1.0.0",
     "author": "YourName",
     "permissions": ["MANAGE_GUILD"],
     "enabled_by_default": true
   }
   ```

3. **Add commands in `/modules/payment-processor/commands/`**
4. **Add event listeners in `/modules/payment-processor/events/`**
5. **Restart the bot** — your module is auto-loaded.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

## Branding

ForgeBot uses a **dark navy** (`#0a0e1a`) background with **gold** (`#FFD700`) accents across all embeds and interactions. Customize in `core/themes.js`.

## Architecture Highlights

### Plugin Loader (`core/loader.js`)
- Scans `/modules` at startup
- Loads `manifest.json` and validates schema
- Registers slash commands and event listeners
- Zero core-code changes for new modules

### Permission Layer (`core/permissions.js`)
- Centralized permission checks
- Per-module rate limiting
- Audit logging
- Graceful error handling

### Database (`core/database.js`)
- SQLite with better-sqlite3
- Per-guild configuration
- Module enable/disable state
- Persistent user data (levels, warns, etc.)

## Contributing

We ❤️ community modules! Read [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to:
- Build a new module with best practices
- Test locally
- Submit a PR

All new modules are validated via GitHub Actions to ensure manifest integrity and code quality.

## Scripts

- `npm start` — Run the bot
- `npm run dev` — Run with hot-reload (`--watch`)
- `npm run create-module <name>` — Scaffold a new module
- `npm run validate-modules` — Check all module manifests
- `npm run lint` — Lint the codebase
- `npm run lint:fix` — Auto-fix lint issues

## License

[MIT](./LICENSE)

## Screenshots / Demo

*Coming soon — dashboard and bot interaction demos*

## Support

- 📖 [Contributing Guide](./CONTRIBUTING.md)
- 📚 [Module Development](./CONTRIBUTING.md#building-a-module)
- 🐛 [Issue Tracker](https://github.com/aadi7036/ForgeBot/issues)

---

Built with ❤️ by the ForgeBot community.
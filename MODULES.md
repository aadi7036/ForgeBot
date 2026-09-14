# ForgeBot Module System

## Quick Start

Create a new module:
```bash
node scripts/create-module.js my-module
```

Validate all modules:
```bash
node scripts/validate-modules.js
```

## Module Structure

Each module is self-contained with commands, events, and metadata:

```
modules/
├── levels/              # XP and leveling
├── moderation/          # Kick, ban, warn
├── stats/              # Game stats lookup
├── music/              # Music playback
└── [your-module]/
    ├── manifest.json
    ├── commands/
    ├── events/
    └── README.md
```

## Built-in Modules

### 📊 Levels
- `/rank` - View your current rank and XP
- `/leaderboard` - View server leaderboard
- Auto-awards XP on messages

### 🔨 Moderation
- `/kick` - Kick a user
- `/ban` - Ban a user
- `/warn` - Warn a user
- `/warnings` - View user's warnings

### 📈 Stats
- `/stats` - Look up game stats (extensible)

### 🎵 Music
- `/play` - Queue a song
- `/queue` - View queue
- `/skip` - Skip current song

## Creating Modules

See CONTRIBUTING.md for detailed guidelines.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Validate: `node scripts/validate-modules.js`
5. Push and create a Pull Request

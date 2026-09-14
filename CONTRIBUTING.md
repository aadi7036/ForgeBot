# Contributing to ForgeBot

Thank you for your interest in contributing to ForgeBot! This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature: `git checkout -b feature/your-feature`
4. **Make your changes** following the style guide below
5. **Test thoroughly** before submitting
6. **Push to your fork** and **create a Pull Request**

## Creating a New Module

Use the module creation script to scaffold a new module:

```bash
node scripts/create-module.js my-module
```

This creates:
- `manifest.json` - Module metadata
- `commands/` - Slash command handlers
- `events/` - Event listeners
- `README.md` - Module documentation

## Module Structure

```
modules/my-module/
├── manifest.json          # Module metadata
├── README.md              # Module documentation
├── commands/
│   ├── command1.js
│   └── command2.js
└── events/
    └── event-handler.js
```

## Code Style

- Use **ES6+ syntax**
- Use **async/await** for asynchronous operations
- Use **2-space indentation**
- Add **JSDoc comments** to functions
- Wrap command logic in try-catch blocks
- Use the theme helpers for consistent UI

## Testing

Before submitting a PR:

1. **Validate module structure**: `node scripts/validate-modules.js`
2. **Test commands** in a Discord server
3. **Check for errors** in console output
4. **Document your changes** in the PR description

## Commit Messages

Use clear, descriptive commit messages with emojis.

## Pull Request Guidelines

- **One feature per PR** - Keep PRs focused
- **Descriptive title** - Clearly describe what your PR does
- **Add context** - Explain why this change is needed
- **Include testing** - Show how you tested the changes

Happy contributing! 🚀

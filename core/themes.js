/**
 * ForgeBot Branding & Theme System
 * Dark navy + gold color scheme for consistent UX
 */

const COLORS = {
  PRIMARY: '#0a0e1a',      // Dark navy background
  ACCENT: '#FFD700',        // Gold accent
  SUCCESS: '#2ecc71',       // Green for success
  ERROR: '#e74c3c',         // Red for errors
  WARNING: '#f39c12',       // Orange for warnings
  INFO: '#3498db',          // Blue for info
};

const createEmbed = (options = {}) => {
  const {
    title = '',
    description = '',
    color = COLORS.ACCENT,
    fields = [],
    thumbnail = null,
    image = null,
    author = null,
    footer = true,
  } = options;

  const embed = {
    title,
    description,
    color: parseInt(color.replace('#', ''), 16),
    fields,
  };

  if (thumbnail) embed.thumbnail = thumbnail;
  if (image) embed.image = image;
  if (author) embed.author = author;

  if (footer) {
    embed.footer = {
      text: 'ForgeBot',
      icon_url: 'https://raw.githubusercontent.com/aadi7036/ForgeBot/main/assets/forgebot-icon.png',
    };
  }

  embed.timestamp = new Date().toISOString();
  return embed;
};

const createSuccessEmbed = (title, description) => {
  return createEmbed({
    title,
    description,
    color: COLORS.SUCCESS,
  });
};

const createErrorEmbed = (title, description) => {
  return createEmbed({
    title,
    description,
    color: COLORS.ERROR,
  });
};

const createWarningEmbed = (title, description) => {
  return createEmbed({
    title,
    description,
    color: COLORS.WARNING,
  });
};

const createInfoEmbed = (title, description) => {
  return createEmbed({
    title,
    description,
    color: COLORS.INFO,
  });
};

export {
  COLORS,
  createEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
  createInfoEmbed,
};

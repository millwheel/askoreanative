/**
 * Mint Theme Configuration for shadcn/ui
 * Primary: #2EC4B6 (mint)
 * Light: #D8F7F3 (light mint)
 * Highlight: #A5EFE7 (secondary mint)
 */

export const mintTheme = {
  colors: {
    primary: '#2EC4B6',
    primaryLight: '#D8F7F3',
    primaryHighlight: '#A5EFE7',
    primaryForeground: '#ffffff',

    secondary: '#A5EFE7',
    secondaryForeground: '#171717',

    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    muted: '#f5f5f5',
    mutedForeground: '#757575',

    accent: '#2EC4B6',
    accentForeground: '#ffffff',

    background: '#ffffff',
    foreground: '#171717',

    border: '#e5e7eb',
    input: '#f3f4f6',
    ring: '#2EC4B6',
  },
};

export const darkMintTheme = {
  colors: {
    primary: '#2EC4B6',
    primaryLight: '#D8F7F3',
    primaryHighlight: '#A5EFE7',
    primaryForeground: '#0a0a0a',

    secondary: '#A5EFE7',
    secondaryForeground: '#ededed',

    destructive: '#ef4444',
    destructiveForeground: '#0a0a0a',

    muted: '#262626',
    mutedForeground: '#a3a3a3',

    accent: '#2EC4B6',
    accentForeground: '#0a0a0a',

    background: '#0a0a0a',
    foreground: '#ededed',

    border: '#262626',
    input: '#1a1a1a',
    ring: '#2EC4B6',
  },
};

// Tailwind config values
export const mintTailwindConfig = {
  extend: {
    colors: {
      primary: {
        50: '#f0fdf9',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#2EC4B6', // Main mint color
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
      },
      accent: {
        50: '#f0fdf9',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#A5EFE7', // Secondary mint
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
      },
    },
  },
};

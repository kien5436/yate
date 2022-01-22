const colors = require('tailwindcss/colors');

/** @type import("tailwindcss/tailwind-config").TailwindConfig */
module.exports = {
  corePlugins: {
    accessibility: false,
    backgroundClip: false,
    clear: false,
    float: false,
    preflight: false,
  },
  darkMode: 'class',
  mode: 'jit',
  plugins: [],
  prefix: 'yate-',
  purge: {
    content: [
      './src/ui/**/*.jsx',
    ],
    enabled: true,
    options: { keyframes: false },
  },
  theme: {
    colors: {
      blue: colors.blue,
      current: 'currentColor',
      gray: colors.gray,
      transparent: 'transparent',
      white: colors.white,
      yellow: colors.yellow,
    },
    extend: {
      boxShadow: { dark: '0 4px 6px -1px rgba(0, 0, 0, 0.9), 0 2px 4px -1px rgba(0, 0, 0, 1) !important' },
      width: { 50: '31.25rem' },
      zIndex: { max: 2147483647 },
    },
  },
  variants: {
    extend: {
      borderWidth: ['focus'],
      margin: ['last'],
    },
  },
};
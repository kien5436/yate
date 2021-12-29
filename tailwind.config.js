/** @type import("tailwindcss/tailwind-config").TailwindConfig */
module.exports = {
  corePlugins: {
    accessibility: false,
    backgroundClip: false,
    clear: false,
    float: false,
  },
  darkMode: 'class',
  important: true,
  mode: 'jit',
  plugins: [],
  purge: {
    content: [
      './src/ui/**/*.jsx',
    ],
    enabled: true,
    options: { keyframes: false },
  },
  theme: {
    extend: {
      width: { 50: '31.25rem' },
      zIndex: { max: 2147483647 },
    },
  },
  variants: { extend: { borderWidth: ['focus'] } },
};
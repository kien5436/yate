module.exports = {
  corePlugins: {
    accessibility: false,
    backgroundClip: false,
    clear: false,
    float: false,
  },
  darkMode: 'class',
  theme: {
    extend: {
      width: {
        50: '31.25rem',
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['focus'],
    },
  },
  plugins: [],
  purge: {
    enabled: true,
    content: [
      './src/**/*.jsx',
    ],
    options: {
      keyframes: true,
    },
  },
}
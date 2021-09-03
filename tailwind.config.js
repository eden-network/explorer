/* eslint-disable import/no-extraneous-dependencies */
const colors = require('tailwindcss/colors');
const forms = require('@tailwindcss/forms');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      blue: {
        light: '#2B305A',
        DEFAULT: '#171C47',
      },
      green: {
        DEFAULT: '#CAFF00',
        mid: '#5FCF87',
        dark: '#25d37e',
      },
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
    },
    fontFamily: {
      sans: ['Titillium Web', 'sans-serif'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [forms],
};

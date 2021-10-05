/* eslint-disable import/no-extraneous-dependencies */
const colors = require('tailwindcss/colors');
const forms = require('@tailwindcss/forms');

module.exports = {
  mode: 'jit',
  purge: {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
    safelist: [
      'text-red',
      'text-yellow',
      'text-purple',
      'text-pink',
      'text-indigo',
      'text-gray-300',
      'bg-red',
      'bg-yellow',
      'bg-purple',
      'bg-pink',
      'bg-indigo',
      'bg-gray-300',
      'bg-green',
    ],
  },
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
      purple: colors.purple['300'],
      pink: colors.pink['300'],
      indigo: colors.green['300'],
      yellow: colors.yellow['300'],
      red: colors.red['300'],
    },
    fontFamily: {
      sans: ['Titillium Web', 'sans-serif'],
    },
    extend: {
      screens: {
        betterhover: { raw: '(hover: hover)' },
      },
      width: {
        '1/100': '7%',
        26: '6.5rem',
        90: '23rem',
      },
    },
  },
  variants: {},
  plugins: [forms],
};

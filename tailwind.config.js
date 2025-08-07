/** @type {import('tailwindcss').Config} */
module.exports = {
  // This path tells Tailwind to scan all HTML files in your templates folder.
  content: [
    "./app/templates/*.html",
  ],

  theme: {
    extend: {},
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },

  // This activates the daisyUI plugin.
  plugins: [
    require('daisyui'),
  ],

  // This specifies which daisyUI themes to include in your final CSS.
  daisyui: {
    themes: ["bumblebee", "luxury"],
  },
}
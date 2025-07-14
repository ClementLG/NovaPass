/** @type {import('tailwindcss').Config} */
module.exports = {
  // This path tells Tailwind to scan all HTML files in your templates folder.
  content: [
    "./app/templates/*.html",
  ],

  theme: {
    extend: {},
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
/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography"; // 1. Importe aqui no topo

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    typography, // 2. Use a variável aqui (sem 'require')
  ],
};

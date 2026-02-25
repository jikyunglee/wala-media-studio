/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wala: {
          dark: "#1a1a1a",
          primary: "#3b82f6",
          accent: "#ec4899",
        }
      },
    },
  },
  plugins: [],
}

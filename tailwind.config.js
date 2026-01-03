/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#f9d406",
        "background-light": "#f8f8f5",
        "background-dark": "#1A1A2E",
        "component-dark": "#1F2937",
        "surface": "#2C2C34",
        "surface-dark": "#1A1A1A",
        "text-primary": "#E0E0E0",
        "text-secondary": "#b9b29d",
        "text-main": "#FFFFFF",
        "primary-text": "#F0F0F0",
        "secondary-text": "#A0A0A0",
        "text-light": "#E0E0E0",
        "text-dark": "#A0A0A0",
        "accent-teal": "#00F5D4",
        "accent-blue": "#007BFF",
        "teal": "#00FFFF",
        "blue": "#4A90E2",
        "border-color": "#3A3A3A",
        "border-dark": "#2A2A2A",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "heading": ["Poppins", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0,0,0,0.2)',
        'glow-primary': '0 0 15px 0 rgba(249, 212, 6, 0.3)',
        'glow-primary-lg': '0 0 25px 0 rgba(249, 212, 6, 0.4)',
      }
    },
  },
  plugins: [],
}


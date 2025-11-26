/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mirc: {
          bg: '#ffffff',           // Pure white background
          panel: '#f7fafc',        // Very light blue-gray panels
          titlebar: '#2b6cb0',     // Professional blue
          titletext: '#ffffff',    // White title text
          border: '#e2e8f0',       // Very soft gray borders
          darkborder: '#cbd5e0',   // Soft gray borders
          text: '#2d3748',         // Dark slate text
          blue: '#3182ce',         // Primary blue (like NetPulse)
          red: '#fc8181',          // Soft red
          green: '#48bb78',        // Success green (like NetPulse OK badge)
          purple: '#9f7aea',       // Soft purple
          orange: '#f6ad55',       // Warm orange
          cyan: '#4299e1',         // Soft blue-cyan
          gray: '#a0aec0',         // Light gray (timestamps)
          darkgray: '#718096',     // Medium gray
        },
      },
      fontFamily: {
        mirc: ['Fixedsys', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}


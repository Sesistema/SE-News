/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf5",
          100: "#d7f3e5",
          200: "#b2e7ce",
          300: "#7dd4ae",
          400: "#43ba88",
          500: "#1f9f6f",
          600: "#16825a",
          700: "#14684a",
          800: "#14523d",
          900: "#124334"
        },
        ink: "#17212f"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        soft: "0 12px 40px rgba(23, 33, 47, 0.12)"
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e7ff",
          200: "#bcd4ff",
          300: "#8fb7ff",
          400: "#5d93ff",
          500: "#3572f5",
          600: "#2559d8",
          700: "#1f48af",
          800: "#203f8a",
          900: "#203869"
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

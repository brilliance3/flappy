/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        game: ['"Press Start 2P"', "system-ui", "sans-serif"],
      },
      colors: {
        sky1: "#7ec8f7",
        sky2: "#b9e3ff",
        cloud: "#fefefe",
        sun: "#ffd97a",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 2.4s ease-in-out infinite",
        pop: "pop 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

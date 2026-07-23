import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial "Sky Blue Creators", derivada del logo
        // (celeste #4a90cd → azul #1e63a6 → navy #0f2c4d).
        sky: {
          50: "#eff6fc",
          100: "#d9e9f7",
          200: "#b7d4ef",
          300: "#8bb8e2",
          400: "#4a90cd", // barra celeste del logo
          500: "#2f77bd",
          600: "#1e63a6", // barra azul media / color primario
          700: "#17518c",
          800: "#103f6e",
          900: "#0f2c4d", // barra navy / texto "SKY BLUE"
        },
        navy: "#0f2c4d",
      },
    },
  },
  plugins: [],
};

export default config;

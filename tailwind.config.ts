import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "Sky Blue" de la agencia.
        sky: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecdff",
          400: "#59b0ff",
          500: "#3392ff",
          600: "#1c72f5",
          700: "#155ce1",
          800: "#184bb6",
          900: "#19428f",
        },
      },
    },
  },
  plugins: [],
};

export default config;

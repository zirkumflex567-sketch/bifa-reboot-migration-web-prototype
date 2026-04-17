import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060a10",
        foreground: "#f0f4fa",
        hud: "rgba(8,12,20,.72)",
        bdr: "rgba(255,255,255,.08)",
        ac: "#ffcc00",
        "redline-green": "#22cc55",
        "team-a": "#3b8bff",
        "team-b": "#ff4444",
        "secondary-text": "#9ab0cc"
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', "sans-serif"],
        rajdhani: ['"Rajdhani"', "system-ui", "sans-serif"],
        outfit: ['"Outfit"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

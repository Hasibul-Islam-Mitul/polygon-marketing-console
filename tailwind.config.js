/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Palette is locked to the project brief.
        canvas: {
          DEFAULT: "#0B0B0D", // deep charcoal base
          raised: "#121316", // cards / raised surfaces
          inset: "#0E0F11", // table rows / inset wells
        },
        line: {
          DEFAULT: "#1F2024", // hairline borders
          strong: "#2A2C31",
        },
        accent: {
          DEFAULT: "#6EDC82", // primary action / active indicators
          dim: "#6EDC8226", // 15% wash for halos & fills
        },
        ink: {
          DEFAULT: "#E1E1E1", // primary text
          muted: "#8E8E93", // secondary / muted text
        },
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(2.2)", opacity: "0" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

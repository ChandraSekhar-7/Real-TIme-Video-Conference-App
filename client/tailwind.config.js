/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette backed by CSS variables for light/dark theming
        void: "rgb(var(--color-void) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surface2: "rgb(var(--color-surface2) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        inkdim: "rgb(var(--color-inkdim) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        teal: "rgb(var(--color-teal) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        // Additional vibrant brand accents remain fixed
        brand: {
          50: "#f0f3ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          glow: "#818cf8",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(240,168,104,0.25), 0 0 24px rgba(240,168,104,0.15)",
        tealglow: "0 0 0 1px rgba(79,209,197,0.3), 0 0 24px rgba(79,209,197,0.18)",
        indigoGlow: "0 0 0 1px rgba(99,102,241,0.3), 0 0 25px rgba(99,102,241,0.4)",
      },
      backdropBlur: {
        glass: "16px",
      },
      keyframes: {
        // Your existing keyframes
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(240,168,104,0.55)" },
          "70%": { boxShadow: "0 0 0 10px rgba(240,168,104,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(240,168,104,0)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(0.6)", opacity: "0" },
          "15%": { opacity: "1", transform: "translateY(-10px) scale(1)" },
          "100%": { transform: "translateY(-160px) scale(1.1)", opacity: "0" },
        },
        // New interactive keyframes
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s infinite",
        floatUp: "floatUp 2.2s ease-out forwards",
        pulseGlow: "pulseGlow 3s infinite ease-in-out",
        float: "float 5s infinite ease-in-out",
        shimmer: "shimmer 2.5s infinite linear",
      },
    },
  },
  plugins: [],
};
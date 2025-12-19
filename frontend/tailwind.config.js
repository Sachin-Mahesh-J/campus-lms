/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lemon: "#D7F06F",
        card: "#FFFFFF",
        cardAlt: "#FDFDFD",
        brand: "#6C5CE7",
        brandSoft: "#E9E3FF",
        accentGreen: "#A3E635",
        accentGreenDark: "#65A30D",
        accentYellow: "#FACC15",
        accentRed: "#F97373",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textMuted: "#9CA3AF",
        borderSubtle: "#E5E7EB",
        badgeBg: "#F3F4F6",
        toggleOff: "#E5E7EB",
        progressTrack: "#E5E7EB",
      },
      boxShadow: {
        card: "0 18px 45px rgba(0, 0, 0, 0.08)",
        cardLight: "0 8px 20px rgba(0, 0, 0, 0.04)",
        floating: "0 10px 25px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        card: "16px",
        cardLg: "24px",
      },
      fontSize: {
        display: ["28px", { lineHeight: "1.3", fontWeight: "700" }],
        h1: ["22px", { lineHeight: "1.3", fontWeight: "700" }],
        h2: ["18px", { lineHeight: "1.35", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5" }],
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0.1px" }],
      },
      transitionTimingFunction: {
        ui: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        ui: "200ms",
        uiFast: "120ms",
      },
      maxWidth: {
        app: "1440px",
      },
    },
  },
  plugins: [],
}


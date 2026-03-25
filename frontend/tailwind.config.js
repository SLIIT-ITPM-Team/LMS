/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#EC489A",
        accent: "#10B981",
        dark: "#1F2937",
      },
      fontFamily: {
        sans: ["Poppins", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(79, 70, 229, 0.55)",
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(at 20% 15%, rgba(79,70,229,0.35) 0px, transparent 45%), radial-gradient(at 80% 10%, rgba(236,72,154,0.28) 0px, transparent 45%), radial-gradient(at 50% 80%, rgba(16,185,129,0.18) 0px, transparent 45%)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -18px, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

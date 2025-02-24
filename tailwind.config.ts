
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        terminal: {
          text: "hsl(var(--terminal-text))",
          hash: "hsl(var(--terminal-hash))",
          nonce: "hsl(var(--terminal-nonce))",
          rate: "hsl(var(--terminal-rate))"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"]
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;

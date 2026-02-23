import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Core System Colors ===
        background: {
          DEFAULT: "hsl(var(--background))",
          dark: "#0A0F14",
          light: "#F4F7FA",
        },
        panel: {
          dark: "rgba(18, 28, 38, 0.72)",
          light: "rgba(255,255,255,0.75)",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          dark: "rgba(255,255,255,0.08)",
          light: "rgba(0,0,0,0.08)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          primaryDark: "#EAF8FF",
          secondaryDark: "#9FB4C8",
          mutedDark: "#6C7A89",
          primaryLight: "#1C2A36",
          secondaryLight: "#3D4F5F",
          mutedLight: "#708090",
        },

        // === Personality Accents ===
        rocket: {
          500: "#2EE6C2",
          600: "#1FC7A7",
          700: "#159C86",
        },

        anchor: {
          400: "#AEB7C2",
          500: "#8E99A8",
        },

        glitch: {
          500: "#E83EFF",
          600: "#C92DE6",
        },

        // Legacy + shadcn/ui compatibility tokens
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          surface: "var(--bg-surface)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Premium surface colors
        surface: {
          DEFAULT: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
          subtle: "var(--bg-surface-subtle)",
        },
        // Premium brand colors
        brand: {
          navy: "hsl(var(--navy))",
          purple: "hsl(var(--purple))",
          cyan: "hsl(var(--cyan))",
          orange: "hsl(var(--orange))",
          red: "hsl(var(--red))",
          yellow: "hsl(var(--yellow))",
        },
        // Enhanced shadows
        "shadow-premium": {
          sm: "var(--shadow-sm)",
          md: "var(--shadow-md)",
          lg: "var(--shadow-lg)",
          xl: "var(--shadow-xl)",
          "2xl": "var(--shadow-2xl)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
      },
      borderRadius: {
        hud: "14px",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      backdropBlur: {
        hud: "18px",
      },
      boxShadow: {
        hudDark: `
          0 0 0 1px rgba(255,255,255,0.02),
          0 8px 32px rgba(0,0,0,0.35)
        `,
        hudLight: `
          0 0 0 1px rgba(0,0,0,0.02),
          0 8px 24px rgba(0,0,0,0.12)
        `,
        rocketGlow: "0 6px 20px rgba(46,230,194,0.4)",
        glitchPulse: "0 0 16px rgba(232,62,255,0.6)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        200: "200ms",
        250: "250ms",
        300: "300ms",
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
      },
      letterSpacing: {
        system: "0.12em",
      },
      animation: {
        "gradient-shift": "gradient-shift 3s ease infinite",
        twinkle: "twinkle 5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

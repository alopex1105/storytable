import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Latin first, then Traditional Chinese, then a generic fallback.
        sans: [
          "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto",
          '"Helvetica Neue"', "Helvetica", "Arial", '"PingFang TC"',
          '"Microsoft JhengHei UI"', '"Microsoft JhengHei"',
          '"Noto Sans CJK TC"', '"Noto Sans TC"', '"Source Han Sans TC"',
          "sans-serif",
        ],
      },
      // Four sizes. Body is 20px because the storyteller may be eighty.
      fontSize: {
        sm: ["15px", { lineHeight: "1.45" }],
        base: ["20px", { lineHeight: "1.6" }],
        lg: ["24px", { lineHeight: "1.5" }],
        xl: ["32px", { lineHeight: "1.25" }],
      },
      borderWidth: {
        hairline: "var(--hairline)",
      },
      colors: {
        // StoryTable: grayscale chrome (Radix sand); colour is left to photos.
        bg: "var(--sand-1)",
        surface: "var(--surface)",
        fill: { DEFAULT: "var(--sand-3)", press: "var(--sand-5)" },
        line: { DEFAULT: "var(--sand-6)", strong: "var(--sand-7)" },
        sub: "var(--sand-11)",
        ink: "var(--sand-12)",
        live: "var(--live)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        hover: {
          bg: "hsl(var(--hover-bg))",
        },
        separator: "hsl(var(--separator))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        // Radii step inward by the padding between them: 24 - 16 = 8.
        card: "24px",
        tile: "16px",
        inner: "8px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

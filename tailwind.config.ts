import type { Config } from "tailwindcss";

/**
 * enterN Design System Configuration
 * 
 * This configuration defines the core design tokens for the enterN application.
 * Updates here will automatically propagate throughout the UI.
 */
export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.16" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'brand-sm': '0 2px 8px 0 rgba(0, 151, 177, 0.15)',
        'brand-md': '0 4px 12px 0 rgba(0, 151, 177, 0.25)',
        'brand-lg': '0 8px 20px 0 rgba(0, 151, 177, 0.3)',
        'accent-sm': '0 2px 8px 0 rgba(255, 102, 196, 0.15)',
        'accent-md': '0 4px 12px 0 rgba(255, 102, 196, 0.25)',
        'accent-lg': '0 8px 20px 0 rgba(255, 102, 196, 0.3)',
      },
      spacing: {
        '4.5': '1.125rem',  // 18px
        '13': '3.25rem',    // 52px
        '18': '4.5rem',     // 72px
      },
      colors: {
        // Brand colors with semantic meanings
        brand: {
          DEFAULT: 'hsl(var(--brand-teal))',
          teal: 'hsl(var(--brand-teal))',
          pink: 'hsl(var(--brand-pink))',
          cyan: 'hsl(var(--brand-cyan))',
          lime: 'hsl(var(--brand-lime))',
          black: 'hsl(var(--brand-black))',
          darkgray: 'hsl(var(--brand-darkgray))',
          gray: 'hsl(var(--brand-gray))',
          lightgray: 'hsl(var(--brand-lightgray))',
          white: 'hsl(var(--brand-white))',
        },
        // Legacy color names for backwards compatibility
        'brand-teal': '#0097B1',
        'brand-pink': '#FF66C4',
        'brand-cyan': '#5CE1E6',
        'brand-black': '#000000',
        'brand-darkgray': '#767979',
        'brand-gray': '#B6B6B6',
        'brand-white': '#FFFFFF',
        'brand-lime': '#C8FD04',
        
        // UI semantics
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          muted: "hsl(var(--primary) / 0.8)",
          light: "hsl(var(--primary) / 0.2)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          muted: "hsl(var(--secondary) / 0.8)",
          light: "hsl(var(--secondary) / 0.2)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          muted: "hsl(var(--accent) / 0.8)",
          light: "hsl(var(--accent) / 0.2)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          muted: "hsl(var(--destructive) / 0.8)",
          light: "hsl(var(--destructive) / 0.2)",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(0 0% 100%)",
          muted: "hsl(var(--success) / 0.8)",
          light: "hsl(var(--success) / 0.2)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(0 0% 0%)",
          muted: "hsl(var(--warning) / 0.8)",
          light: "hsl(var(--warning) / 0.2)",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(0 0% 100%)",
          muted: "hsl(var(--info) / 0.8)",
          light: "hsl(var(--info) / 0.2)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
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
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        "fade-out": {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        "slide-in-right": {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        "slide-in-left": {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.3s ease-in",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

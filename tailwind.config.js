/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /*
         * The studio palette, Pentagram-system edition: white ground,
         * near-black ink (#1A1A1A), gray secondary voice (#767676),
         * and a single heritage-red signal (Ghana flag red) that is
         * never a surface colour — it marks live/selected states.
         * `paper` is kept as an alias so existing screens resolve.
         */
        paper: {
          DEFAULT: "#FFFFFF",
          deep: "#F5F5F5",
        },
        ground: {
          DEFAULT: "#FFFFFF",
          deep: "#F5F5F5",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#767676",
        },
        hairline: "#E3E4E5",
        brand: {
          DEFAULT: "#E4002B",
          dark: "#B80023",
          light: "#FF4D4D",
        },
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
      },
      zIndex: {
        header: "1050",
        banner: "1060",
        "map-widget": "1000",
        "map-panel": "1002",
        modal: "2000",
        toast: "9999",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter Tight",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Inter Tight",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      transitionDuration: {
        250: "250ms",
        1200: "1200ms",
      },
      transitionTimingFunction: {
        /* The single house easing for entrances and reveals */
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        /* The Pentagram signature ease, captured from their build CSS */
        house: "cubic-bezier(0.59, 0.01, 0.28, 1)",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "0.75rem",
        sm: "1rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
      },
      screens: { "2xl": "1792px" },
    },
  },
  future: {
    /* Hover styles only for true pointers, matching Pentagram's media guard */
    hoverOnlyWhenSupported: true,
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "class",
};

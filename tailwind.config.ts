import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF3FF",
          100: "#DCE7FF",
          200: "#B9CFFF",
          300: "#8FB0FF",
          400: "#5C87F5",
          500: "#3563E9",
          600: "#274BC4",
          700: "#1E3A9A",
          800: "#182E76",
          900: "#13235A",
        },
        ink: {
          50: "#F6F7F9",
          100: "#EDEFF3",
          200: "#DBDFE6",
          300: "#B7BFCB",
          400: "#8A93A3",
          500: "#616B7D",
          600: "#454E60",
          700: "#313847",
          800: "#212633",
          900: "#141821",
        },
        surface: "#FFFFFF",
        bg: "#F5F6FA",
        success: "#1E9E5A",
        warning: "#C57A11",
        danger: "#D6423A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,24,33,0.05), 0 1px 0 rgba(20,24,33,0.03)",
        floating: "0 8px 24px rgba(20,24,33,0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;

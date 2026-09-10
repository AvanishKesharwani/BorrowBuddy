import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#F0FAF9',
          100: '#E6F4F3',
          200: '#CCEAE8',
          300: '#99D5D1',
          400: '#4DB5AE',
          500: '#14938B',
          600: '#0D7A75', // Primary signature teal from mockup
          700: '#0A615D',
          800: '#074946',
          900: '#043230',
          950: '#021C1B',
        },
        mint: {
          50: '#F6FCFB',
          100: '#E8F6F5',
          200: '#D1EDEA',
          300: '#B0DFDB',
        },
        iiit: {
          50: '#F0FAF9',
          100: '#E6F4F3',
          500: '#14938B',
          600: '#0D7A75',
          700: '#0A615D',
          800: '#074946',
          900: '#043230',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
export default config;

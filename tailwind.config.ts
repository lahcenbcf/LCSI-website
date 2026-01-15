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
        mainBlue: "var(--color-mainBlue)",
        grayBorder: "var(--color-grayBorder)",
        darkgrayTxt: "var(--color-darkgrayTxt)",
        lightgrayTxt: "var(--color-lightgrayTxt)",
        grayRectangle: "var(--color-grayRectangle)",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        integralCF: ["var(--font-integralCF)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

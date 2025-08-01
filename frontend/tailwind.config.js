/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#395886",
        secondary: "#477977",
        white: "#EEF0F5",
        light: "#f7f7f7",
        light2: "#DAE0E9",
        dark: "#333333",
        dark2: "#999999",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "0.1rem",
        },
        screens: {
          DEFAULT: "0%",
        },
      },
    },
  },
  plugins: [],
};

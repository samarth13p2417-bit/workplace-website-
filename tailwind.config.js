/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jira: {
          blue: '#0052CC',
          hoverBlue: '#0065FF',
          activeBlue: '#0747A6',
          bg: '#FAFBFC',
          border: '#DFE1E6',
          textDark: '#172B4D',
          textMuted: '#5E6C84',
          link: '#0052CC',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'jira-card': 'rgba(0, 0, 0, 0.1) 0px 0px 10px',
      },
    },
  },
  plugins: [],
}

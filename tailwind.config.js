import { defineConfig } from '@tailwindcss/cli'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8168f0',
        'primary-hover': '#6345dc',
        'primary-light': '#cec3fc',
        background: '#fff',
        'background-secondary': '#f8f9fb',
        'text-primary': '#333f48',
        'text-secondary': '#576875',
        'text-disabled': '#9199a3',
        border: '#e2e2e2',
        'border-focus': '#8168f0',
        success: '#31c2a7',
        warning: '#f08c1a',
        danger: '#ff0066',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
})
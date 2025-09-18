import { defineConfig } from '@tailwindcss/cli'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant Electric Color System
        primary: {
          DEFAULT: '#00FFFF', // Electric Cyan
          hover: '#00E6E6',
          active: '#00CCCC',
          light: '#80FFFF',
          lighter: '#E6FFFF',
          dark: '#00B3B3',
        },

        // Neon Secondary Colors
        secondary: {
          DEFAULT: '#FF1493', // Deep Pink
          light: '#FF69B4',
          dark: '#DC143C',
        },

        // Vibrant Status Colors
        success: {
          DEFAULT: '#00FF00', // Lime Green
          hover: '#00E600',
          light: '#80FF80',
          dark: '#00CC00',
        },

        warning: {
          DEFAULT: '#FF8C00', // Dark Orange
          hover: '#FF7F00',
          light: '#FFB347',
          dark: '#FF6100',
        },

        danger: {
          DEFAULT: '#FF0080', // Electric Pink
          hover: '#E6006B',
          light: '#FF80BF',
          dark: '#CC0066',
        },

        // Vibrant Light Background Palette
        background: {
          DEFAULT: '#FFFFFF', // Pure White
          secondary: '#F0F8FF', // Alice Blue
          tertiary: '#E6F3FF', // Light Blue
          accent: '#FFE4E1', // Misty Rose
          dark: '#F5F5DC', // Beige
        },

        // Neon Border System
        border: {
          DEFAULT: '#00FFFF',
          light: '#80FFFF',
          medium: '#FF1493',
          dark: '#8A2BE2',
          primary: '#00FFFF',
          success: '#00FF00',
          warning: '#FF8C00',
          danger: '#FF0080',
        },

        // Vibrant Light Text Hierarchy
        text: {
          primary: '#1A1A1A', // Dark text for readability
          secondary: '#0066CC', // Deep Blue
          tertiary: '#CC0066', // Deep Pink
          accent: '#008000', // Dark Green
          white: '#ffffff',
          success: '#006600', // Dark Green
          warning: '#CC6600', // Dark Orange
          danger: '#CC0044', // Dark Red
        },

        // Electric Interactive Elements
        interactive: {
          primary: '#00FFFF',
          'primary-hover': '#00E6E6',
          secondary: '#FF1493',
          'secondary-hover': '#DC143C',
          success: '#00FF00',
          'success-hover': '#00E600',
          warning: '#FF8C00',
          'warning-hover': '#FF7F00',
          danger: '#FF0080',
          'danger-hover': '#E6006B',
        },

        // Vibrant Light Card Backgrounds
        card: {
          DEFAULT: '#FFFFFF',
          secondary: '#F0F8FF',
          accent: '#FFE4E1',
          hover: '#E6F3FF',
        },
      },

      // Vibrant Neon Box Shadows
      boxShadow: {
        'sm': '0 0 5px rgba(0, 255, 255, 0.3)',
        'DEFAULT': '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(255, 20, 147, 0.3)',
        'md': '0 0 15px rgba(0, 255, 255, 0.6), 0 0 30px rgba(255, 20, 147, 0.4)',
        'lg': '0 0 25px rgba(0, 255, 255, 0.7), 0 0 50px rgba(255, 20, 147, 0.5)',
        'xl': '0 0 35px rgba(0, 255, 255, 0.8), 0 0 70px rgba(255, 20, 147, 0.6)',
        'colored-primary': '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
        'colored-success': '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.4)',
        'colored-warning': '0 0 20px rgba(255, 140, 0, 0.8), 0 0 40px rgba(255, 140, 0, 0.4)',
        'colored-danger': '0 0 20px rgba(255, 0, 128, 0.8), 0 0 40px rgba(255, 0, 128, 0.4)',
        'hover': '0 0 30px rgba(0, 255, 255, 0.9), 0 0 60px rgba(255, 20, 147, 0.7)',
        'button': '0 0 15px rgba(0, 255, 255, 0.6)',
        'button-hover': '0 0 25px rgba(0, 255, 255, 0.8), 0 0 50px rgba(0, 255, 255, 0.4)',
      },

      // Enhanced Border Radius
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },

      // Professional Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Typography Scale
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },

      // Professional Transitions
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },

      // Animation Enhancements
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-up': 'scaleUp 150ms ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
})
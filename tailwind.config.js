import { defineConfig } from '@tailwindcss/cli'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant but Readable Primary Color
        primary: {
          DEFAULT: '#3B82F6', // Blue
          hover: '#2563EB',
          active: '#1D4ED8',
          light: '#93C5FD',
          lighter: '#DBEAFE',
          dark: '#1E40AF',
        },

        // Vibrant Secondary Colors
        secondary: {
          DEFAULT: '#EC4899', // Pink
          light: '#F9A8D4',
          dark: '#BE185D',
        },

        // Readable Status Colors
        success: {
          DEFAULT: '#10B981', // Emerald Green
          hover: '#059669',
          light: '#A7F3D0',
          dark: '#047857',
        },

        warning: {
          DEFAULT: '#F59E0B', // Amber
          hover: '#D97706',
          light: '#FDE68A',
          dark: '#B45309',
        },

        danger: {
          DEFAULT: '#EF4444', // Red
          hover: '#DC2626',
          light: '#FCA5A5',
          dark: '#B91C1C',
        },

        // Clean Light Background Palette
        background: {
          DEFAULT: '#FFFFFF', // Pure White
          secondary: '#F8FAFC', // Very Light Gray
          tertiary: '#F1F5F9', // Light Gray
          accent: '#FEF2F2', // Very Light Red
          dark: '#E2E8F0', // Light Blue Gray
        },

        // Clean Border System
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
          medium: '#94A3B8',
          dark: '#475569',
          primary: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },

        // Clean Readable Text Hierarchy
        text: {
          primary: '#1F2937', // Dark Gray
          secondary: '#6B7280', // Medium Gray
          tertiary: '#9CA3AF', // Light Gray
          accent: '#3B82F6', // Blue
          white: '#FFFFFF',
          success: '#059669', // Green
          warning: '#D97706', // Orange
          danger: '#DC2626', // Red
        },

        // Clean Interactive Elements
        interactive: {
          primary: '#3B82F6',
          'primary-hover': '#2563EB',
          secondary: '#EC4899',
          'secondary-hover': '#BE185D',
          success: '#10B981',
          'success-hover': '#059669',
          warning: '#F59E0B',
          'warning-hover': '#D97706',
          danger: '#EF4444',
          'danger-hover': '#DC2626',
        },

        // Clean Card Backgrounds
        card: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          accent: '#FEF2F2',
          hover: '#F1F5F9',
        },
      },

      // Clean Professional Box Shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'colored-primary': '0 4px 14px 0 rgba(59, 130, 246, 0.15)',
        'colored-success': '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
        'colored-warning': '0 4px 14px 0 rgba(245, 158, 11, 0.15)',
        'colored-danger': '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
        'hover': '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
        'button': '0 2px 4px -1px rgba(59, 130, 246, 0.2)',
        'button-hover': '0 4px 8px -2px rgba(59, 130, 246, 0.25)',
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
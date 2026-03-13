import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        // Background colors mapped to CSS custom properties
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          hover: 'var(--bg-hover)',
        },
        // Border colors
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        // Text colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        // Accent colors
        accent: {
          primary: 'var(--accent-primary)',    // Teal
          secondary: 'var(--accent-secondary)', // Orange
          danger: 'var(--accent-danger)',
          success: 'var(--accent-success)',
          warning: 'var(--accent-warning)',
        },
        // Camelot key colors (musical harmony wheel)
        key: {
          1: 'var(--key-1)',
          2: 'var(--key-2)',
          3: 'var(--key-3)',
          4: 'var(--key-4)',
          5: 'var(--key-5)',
          6: 'var(--key-6)',
          7: 'var(--key-7)',
          8: 'var(--key-8)',
          9: 'var(--key-9)',
          10: 'var(--key-10)',
          11: 'var(--key-11)',
          12: 'var(--key-12)',
        },
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.2)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;

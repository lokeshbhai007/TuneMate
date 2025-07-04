// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: 'var(--color-terminal-bg)',
          card: 'var(--color-terminal-card)',
          border: 'var(--color-terminal-border)',
          green: 'var(--color-terminal-green)',
          blue: 'var(--color-terminal-blue)',
          purple: 'var(--color-terminal-purple)',
          text: 'var(--color-terminal-text)',
          muted: 'var(--color-terminal-muted)',
          yellow: 'var(--color-terminal-yellow)',
          red: 'var(--color-terminal-red)',
        }
      },
      fontFamily: {
        mono: ['var(--font-family-mono)'],
      }
    },
  },
  plugins: [],
}

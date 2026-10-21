import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Three layers. See globals.css for why.
        bg: 'var(--koos-bg)',
        surface: 'var(--koos-surface)',
        raised: 'var(--koos-raised)',
        line: 'var(--koos-line)',
        'line-strong': 'var(--koos-line-strong)',
        'control-line': 'var(--koos-control-line)',

        // The only interactive colour.
        accent: 'var(--koos-accent)',
        'accent-hover': 'var(--koos-accent-hover)',
        'accent-soft': 'var(--koos-accent-soft)',
        'on-accent': 'var(--koos-on-accent)',

        ink: 'var(--koos-ink)',
        muted: 'var(--koos-muted)',

        // Display decoration only — never body text, never a control.
        rose: 'var(--koos-rose)',
        'rose-deep': 'var(--koos-rose-deep)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { koos: '12px' },
      letterSpacing: { eyebrow: '0.08em' },
    },
  },
  plugins: [],
} satisfies Config

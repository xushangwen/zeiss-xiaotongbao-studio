import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:            '#08101f',
        surface:       '#0e1929',
        's2':          '#152035',
        's3':          '#1c2d47',
        border:        '#1e3050',
        'border-light':'#2a4060',
        accent:        '#1a56db',
        'accent-h':    '#2563eb',
        'accent-glow': 'rgba(26,86,219,0.25)',
        'accent-light':'#3b82f6',
        'zeiss':       '#0047ab',
        'tx':          '#e8edf5',
        'tx-muted':    '#5f7a99',
        'tx-dim':      '#3d5470',
        'ok':          '#16a34a',
        'ok-bg':       'rgba(22,163,74,0.12)',
      },
      fontFamily: {
        sans:  ['IBM Plex Sans SC', 'system-ui', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      gridTemplateColumns: {
        studio: '268px 1fr 400px',
      },
      gridTemplateRows: {
        studio: '48px 1fr',
      },
      animation: {
        'pulse-dot': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 0.7s linear infinite',
        'slide-in': 'slideIn 0.2s ease',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config

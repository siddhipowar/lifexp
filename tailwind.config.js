/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush:    { 50: '#fff5f7', 100: '#ffe0e8', 200: '#ffbdd0', 300: '#ff94b5', 400: '#ff6a99', 500: '#f04d80', 600: '#d63870', 700: '#b52a5d', 800: '#8f1f49', 900: '#6b1537' },
        lavender: { 50: '#f8f5ff', 100: '#efe8ff', 200: '#ddd0ff', 300: '#c4adff', 400: '#a880ff', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95' },
        mauve:    { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f3d0fe', 300: '#e9abfc', 400: '#d977f8', 500: '#c44bf3', 600: '#a927d9', 700: '#8b1db8', 800: '#741b96', 900: '#601a7a' },
        peach:    { 50: '#fff8f1', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' },
        sage:     { 50: '#f6faf3', 100: '#e9f5e3', 200: '#d1e8c7', 300: '#add5a0', 400: '#83bc78', 500: '#5e9e55', 600: '#477f3f', 700: '#3a6534', 800: '#30522c', 900: '#274525' },
        gold:     { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Nunito"', 'system-ui', 'sans-serif'],
        sans:    ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cozy-gradient':  'linear-gradient(135deg, #fff5f7 0%, #fae8ff 40%, #ffe8f0 70%, #fff8f1 100%)',
        'hero-gradient':  'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 50%, #fce7f3 100%)',
        'soul-gradient':  'linear-gradient(135deg, #ede9fe 0%, #fce7f3 50%, #fdf2f8 100%)',
        'btn-primary':    'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)',
        'btn-soul':       'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        'xp-bar':         'linear-gradient(90deg, #f43f5e, #a855f7, #6366f1)',
      },
      boxShadow: {
        'cozy':        '0 4px 24px rgba(244, 63, 94, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'cozy-lg':     '0 8px 40px rgba(168, 85, 247, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'glow-pink':   '0 0 20px rgba(244, 63, 94, 0.25)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
        'glow-soul':   '0 0 30px rgba(168, 85, 247, 0.3), 0 0 60px rgba(244, 63, 94, 0.15)',
        'card':        '0 2px 16px rgba(200, 100, 150, 0.08)',
      },
      animation: {
        'float':       'float 3s ease-in-out infinite',
        'pulse-soft':  'pulse-soft 2s ease-in-out infinite',
        'sparkle':     'sparkle 1.5s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'slide-up':    'slide-up 0.4s ease-out',
        'fade-in':     'fade-in 0.3s ease-out',
        'pop':         'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        float:         { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'pulse-soft':  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        sparkle:       { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.6', transform: 'scale(1.2) rotate(180deg)' } },
        'bounce-soft': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        shimmer:       { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'slide-up':    { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':     { from: { opacity: '0' }, to: { opacity: '1' } },
        pop:           { '0%': { transform: 'scale(0.9)' }, '60%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}

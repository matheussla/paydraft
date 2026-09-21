export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        solana: {
          purple: {
            DEFAULT: '#9945FF',
            dark: '#7B3CCB',
            light: '#B67AFF',
          },
          green: {
            DEFAULT: '#14F195',
            dark: '#0FBE77',
            light: '#5FF4B3',
          },
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
        },
      },
    },
  },
  plugins: [],
};

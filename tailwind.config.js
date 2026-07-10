/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色：沉稳蓝（信任 / 应急 / 政务）
        brand: {
          50: '#eff5ff',
          100: '#dbe8fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#6094fa',
          500: '#3b74f6',
          600: '#2559eb',
          700: '#1d47d8',
          800: '#1e3caf',
          900: '#1e388a',
        },
        // 语义强调色（仅用于表达含义：紧急 / 预警 / 安全）
        danger: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
        warn: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        safe: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"',
          '"Microsoft YaHei"', '"Hiragino Sans GB"', 'Roboto', 'system-ui', 'sans-serif',
        ],
      },
      maxWidth: { app: '480px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.05)',
        soft: '0 6px 20px rgba(15,23,42,0.07)',
        header: '0 1px 0 rgba(15,23,42,0.06)',
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
    },
  },
  plugins: [],
}

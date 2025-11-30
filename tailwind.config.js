/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'fire-red': '#ef4444',
                'fire-orange': '#f97316',
                'safety-yellow': '#eab308',
                'slate-dark': '#0f172a',
                'slate-light': '#334155',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

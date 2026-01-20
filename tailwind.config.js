/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Alma Brand Colors
                'alma-blue': {
                    50: '#eef5ff',
                    100: '#d9e8ff',
                    200: '#bcd8ff',
                    300: '#8ec1ff',
                    400: '#599fff',
                    500: '#3378fc',
                    600: '#1d58f1',
                    700: '#1545de',
                    800: '#1839b4',
                    900: '#1a365d', // Primary - Azul Profundo
                    950: '#141e33',
                },
                'alma-magenta': {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d', // Accent - Magenta
                    900: '#831843',
                    950: '#500724',
                },
                'alma-lilac': {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff', // Background - Lilás
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7c3aed',
                    800: '#6b21a8',
                    900: '#581c87',
                    950: '#3b0764',
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'aurora-1': 'aurora1 20s ease-in-out infinite',
                'aurora-2': 'aurora2 25s ease-in-out infinite',
                'aurora-3': 'aurora3 30s ease-in-out infinite',
                'aurora-4': 'aurora4 22s ease-in-out infinite',
            },
            keyframes: {
                aurora1: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.4' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)', opacity: '0.5' },
                    '66%': { transform: 'translate(-20px, 30px) scale(0.9)', opacity: '0.3' },
                },
                aurora2: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
                    '50%': { transform: 'translate(-40px, 40px) scale(1.15)', opacity: '0.45' },
                },
                aurora3: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.25' },
                    '25%': { transform: 'translate(50px, -30px) scale(1.05)', opacity: '0.35' },
                    '75%': { transform: 'translate(-30px, 20px) scale(1.1)', opacity: '0.3' },
                },
                aurora4: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.2' },
                    '40%': { transform: 'translate(-25px, 35px) scale(1.08)', opacity: '0.3' },
                    '80%': { transform: 'translate(20px, -20px) scale(0.95)', opacity: '0.25' },
                },
            },
        },
    },
    plugins: [],
}

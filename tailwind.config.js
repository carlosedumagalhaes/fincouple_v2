/** @type {import('tailwindcss').Config} */
export default {
  // Garante que o Tailwind procure classes em todos os arquivos do seu projeto
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  
  // CORREÇÃO CRUCIAL: Força o ecossistema do Tailwind a trabalhar em modo Dark nativo
  darkMode: 'class', 
  
  theme: {
    extend: {
      // Injeta os tokens do seu design system nas utilidades do Tailwind caso precise usar via classes inline
      colors: {
        cadu: '#6E6BF5',
        steph: '#F2537A',
        sysBg: '#000000',
      },
    },
  },
  plugins: [],
}

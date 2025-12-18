import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Para GitHub Pages, mude para '/nome-do-repositorio/'
    // Para desenvolvimento local, deixe '/'
    base: mode === 'production' ? '/amigo-trunfo-xp/' : '/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'html-to-image': 'https://esm.sh/html-to-image@1.11.11',
        '@supabase/supabase-js': 'https://esm.sh/@supabase/supabase-js@2.47.10'
      }
    },

    optimizeDeps: {
      exclude: ['html-to-image', '@supabase/supabase-js']
    }
  };
});

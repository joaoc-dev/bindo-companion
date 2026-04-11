import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const companionOrigin
  = process.env.SERVER_HTTP
    || process.env.SERVER_HTTPS
    || process.env.VITE_COMPANION_API_ORIGIN
    || 'http://localhost:5100';

const skullKingOrigin
  = process.env.VITE_SKULL_KING_API_ORIGIN || 'http://localhost:5101';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/skull-king': {
        target: skullKingOrigin,
        changeOrigin: true,
      },
      '/api': {
        target: companionOrigin,
        changeOrigin: true,
      },
    },
  },
});

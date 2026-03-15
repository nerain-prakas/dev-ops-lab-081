import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    // Output to a directory that Flask can serve
    outDir: 'backend/static',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    // Proxy API requests to the Flask backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

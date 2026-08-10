import { defineConfig } from 'vite';
import { resolve } from 'path';

// Multi-page vanilla JS app. Scripts are classic (non-module) and reference
// each other through globals, so we keep them as-is and only bundle the CSS.
export default defineConfig({
  root: '.',
  base: './',
  server: { port: 5173, host: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        patients: resolve(__dirname, 'patients.html'),
        doctors: resolve(__dirname, 'doctors.html'),
      },
    },
  },
});

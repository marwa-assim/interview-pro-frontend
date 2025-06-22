// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5174,
      hmr: {
        clientPort: 443,
      },
      watch: {
        usePolling: true,
      },
      allowedHosts: [
        'https://interview-pro-frontend.onrender.com'
        // e.g. 'interview-pro-frontend.onrender.com'
      ]
    },
    define: {
      __APP_BACKEND_URL__: JSON.stringify(env.VITE_APP_BACKEND_URL),
    },
  };
});

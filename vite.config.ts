import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // Expose selected env vars to the client via `import.meta.env.*`.
      // `.env.local` can still define `GEMINI_API_KEY=...`.
      envPrefix: ['VITE_', 'GEMINI_'],
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

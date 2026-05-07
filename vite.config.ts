import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // Shiki ships every TextMate grammar we registered, so the highlighter
    // is by far the biggest chunk. ~300 KB gzipped is fine for a local-first
    // study app; raise the warning ceiling so it stops shouting.
    chunkSizeWarningLimit: 2000,
  },
});

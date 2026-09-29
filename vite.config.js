import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-beautiful-dnd': '@hello-pangea/dnd',
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

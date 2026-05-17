import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/soft_traces_triptych/',
  plugins: [react()],
});


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Nếu bạn đặt tên repo là 'dai-tinh-bill', hãy đổi base thành '/dai-tinh-bill/'
export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
  }
});

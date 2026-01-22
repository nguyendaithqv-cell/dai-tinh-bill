
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base là './' giúp app chạy được ở bất kỳ thư mục nào trên GitHub Pages
  base: './',
  define: {
    // Đoạn này cực kỳ quan trọng: nó giúp app lấy được API_KEY anh đã dán trong Settings
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
  }
});

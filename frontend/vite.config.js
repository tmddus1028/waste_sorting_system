import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        upload: resolve(__dirname, 'upload.html'),
        result: resolve(__dirname, 'result.html'),
        guide: resolve(__dirname, 'guide.html'),
        guideDetail: resolve(__dirname, 'guide-detail.html'),
        search: resolve(__dirname, 'search.html'),
        localRules: resolve(__dirname, 'local-rules.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
});
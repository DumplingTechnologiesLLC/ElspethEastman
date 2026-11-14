import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import svgr from 'vite-plugin-svgr';
import { deploymentArtifacts } from './tooling/deploymentArtifacts.ts';
export default defineConfig({
  root: 'frontend',
  plugins: [
    stylex.vite({ useCSSLayers: false, runtimeInjection: false }),
    svgr(),
    react(),
    deploymentArtifacts(),
  ],
  build: {
    outDir: '../public/build',
    emptyOutDir: true,
    assetsDir: 'static/media',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/media/[name]-[hash][extname]',
      },
    },
  },
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false },
    },
  },
});

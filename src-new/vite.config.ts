import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the Lekkerkuier v3 SPA rebuild.
//
// Key choices:
//   * HashRouter-friendly: the SPA uses react-router-dom
//     HashRouter so no nginx try_files rewrite is needed.
//     Build paths are still fingerprinted under /assets/
//     so cache-busting works.
//   * Atomic cutover: `outDir` is `../public-staging/`,
//     NOT `../public/`. Vite writes the build output to a
//     non-live sibling directory; the actual cutover is
//     performed by /opt/radio/web/src-new/scripts/cutover.sh
//     which (a) wipes the live `assets/` to evict stale
//     hashes, (b) rsyncs the staging directory on top of
//     the live root, (c) reloads nginx. With this two-step
//     layout, an interrupted `npm run build` cannot
//     half-replace the live index.html.
//   * chunkSizeWarningLimit set to 600 KB — keeps the
//     vendor + app bundles each well under 1 MB and well
//     under nginx's `large_client_header_buffers` budget.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: '../public-staging',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          // Pull react + react-dom into a stable vendor chunk so
          // framework code can be cached aggressively; route-
          // specific pages keep their own small chunks.
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});

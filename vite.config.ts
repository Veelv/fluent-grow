import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import lightningcssConfig from './lightningcss.config';

export default defineConfig(({ command }) => ({
  // Only enable legacy plugin during dev/preview (not in library build mode)
  plugins: command === 'serve'
    ? [
        legacy({
          targets: ['defaults', 'Firefox ESR', 'not IE 11'],
          modernPolyfills: true,
          additionalLegacyPolyfills: ['regenerator-runtime/runtime']
        })
      ]
    : [],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'FluentGrow',
      fileName: 'main',
      formats: ['es']
    },
    rollupOptions: {
      external: [],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        manualChunks: undefined,
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        compact: true,
        generatedCode: {
          constBindings: true,
          objectShorthand: true
        }
      }
    },
    // Lower target to broaden compatibility; modern bundle still served where supported
    target: 'es2018',
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    sourcemap: true,
    emptyOutDir: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 35000
  },
  esbuild: {
    target: 'es2018',
    format: 'esm',
    platform: 'browser',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  css: {
    lightningcss: lightningcssConfig as any
  },
  server: {
    port: 3000,
    open: false,
    cors: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    __DEV__: 'false'
  }
}));
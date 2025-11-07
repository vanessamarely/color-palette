import { defineConfig } from 'vite';

/**
 * Configuración específica de Vite para Angular 20
 * Optimizaciones y mejores prácticas para desarrollo y producción
 */
export default defineConfig({
  // Configuración de desarrollo
  server: {
    port: 4200,
    host: true,
    cors: true,
    // HMR optimizado para Angular
    hmr: {
      overlay: true,
      clientPort: 4200
    }
  },

  // Optimizaciones de build
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    
    // Optimizaciones específicas para Angular
    rollupOptions: {
      output: {
        // Chunks optimizados
        manualChunks: {
          'angular-core': ['@angular/core', '@angular/common'],
          'angular-forms': ['@angular/forms'],
          'angular-router': ['@angular/router'],
          'rxjs': ['rxjs'],
          'google-ai': ['@google/generative-ai']
        }
      }
    },
    
    // Minificación optimizada
    minify: 'esbuild',
    
    // Configuración de CSS
    cssCodeSplit: true,
    cssMinify: true
  },

  // Configuración de dependencias
  optimizeDeps: {
    include: [
      '@angular/core',
      '@angular/common',
      '@angular/forms',
      '@angular/platform-browser',
      'rxjs',
      '@google/generative-ai'
    ],
    // Forzar re-optimización en desarrollo
    force: false
  },

  // Configuración de resolución de módulos
  resolve: {
    alias: {
      '@': '/src',
      '@app': '/src/app',
      '@shared': '/src/app/shared',
      '@services': '/src/app/services',
      '@components': '/src/app/components'
    }
  },

  // Variables de entorno
  envPrefix: 'VITE_',
  
  // Configuración específica para SSR
  ssr: {
    noExternal: [
      '@angular/**',
      '@google/generative-ai'
    ]
  },

  // Configuración de plugins (Angular CLI maneja esto automáticamente)
  plugins: [],

  // Configuración de worker
  worker: {
    format: 'es'
  },

  // Configuración de JSON
  json: {
    namedExports: true,
    stringify: false
  },

  // Configuración de preview (para testing de build)
  preview: {
    port: 4173,
    host: true,
    cors: true
  }
});
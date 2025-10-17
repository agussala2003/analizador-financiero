/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Configuración de desarrollo para reducir warnings
  server: {
    warmup: {
      // Pre-cargar estos módulos para evitar warnings de preload
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
      ]
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Configuración de módulos preload
    modulePreload: {
      polyfill: false, // Desactiva el polyfill de modulepreload
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Charts library - heavy dependency (299 kB)
          'recharts-vendor': ['recharts'],
          
          // PDF/Export libraries
          'export-vendor': ['html2canvas', 'jspdf'],
          
          // UI library - Radix UI components
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          
          // Date utilities
          'date-vendor': ['date-fns'],
          
          // State management
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          
          // Backend
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Icons
          'icons-vendor': ['lucide-react'],
          
          // Utilities
          'utils-vendor': ['clsx', 'tailwind-merge', 'framer-motion', 'sonner', 'dompurify'],
        },
      },
    },
    // Increase chunk size warning limit to 600kb
    chunkSizeWarningLimit: 600,
  },
})
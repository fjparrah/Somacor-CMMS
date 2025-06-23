import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir advertencias de TypeScript durante el build
        if (warning.code === 'TYPESCRIPT_ERROR') return;
        warn(warning);
      }
    }
  },
  esbuild: {
    // Deshabilitar verificación de tipos en esbuild
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})

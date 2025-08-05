import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expone la variable de entorno al código del cliente.
    // Vite reemplazará `process.env.API_KEY` con el valor real durante la compilación.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
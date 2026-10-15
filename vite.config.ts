import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative assets work on both username.github.io and username.github.io/repository/.
export default defineConfig({ plugins: [react()], base: './' })

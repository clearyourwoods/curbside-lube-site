import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/curbside-lube-site/', // Adjust if using GitHub Project Pages
})

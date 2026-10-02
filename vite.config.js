import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// base './' keeps asset paths valid under github.io/<repo-name>/
export default defineConfig({ base: './', plugins: [vue(), tailwindcss()] })

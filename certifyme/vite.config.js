import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        exams: resolve(__dirname, 'exams/exams.html'),
        preguntas: resolve(__dirname, 'preguntas/preguntas.html'),
        resultado: resolve(__dirname, 'resultado/resultado.html'),
        profile: resolve(__dirname, 'profile/index.html'),
        qalab: resolve(__dirname, 'qa-lab/index.html'),
      }
    }
  }
})

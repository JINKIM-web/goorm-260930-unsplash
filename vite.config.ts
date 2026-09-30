import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages는 https://<user>.github.io/<저장소이름>/ 경로로 서비스되므로 배포 빌드에만 base를 붙인다.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? '/goorm-260930-unsplash/' : '/',
}))

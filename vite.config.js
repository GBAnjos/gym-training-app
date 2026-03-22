import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Generate a version file on build so the app can detect new deploys
function versionPlugin() {
  return {
    name: 'version-plugin',
    writeBundle(options) {
      const outDir = options.dir || 'dist'
      const version = Date.now().toString()
      writeFileSync(resolve(outDir, 'version.txt'), version)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionPlugin()],
  base: '/gym-training-app/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
  },
})

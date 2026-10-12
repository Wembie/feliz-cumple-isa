import { defineConfig, devices } from '@playwright/test'

const PUERTO = 4173

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // Páginas con mucha animación: más navegadores a la vez las vuelven lentas e inestables.
  workers: 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // Misma ruta que en GitHub Pages: así se comprueba que los recursos cargan con el base correcto.
    baseURL: `http://localhost:${PUERTO}/feliz-cumple-isa/`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  // Página de pruebas: plantilla pública de textos (dist-prueba, `npm run build:prueba`).
  webServer: {
    command: `npx vite preview --outDir dist-prueba --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}/feliz-cumple-isa/`,
    reuseExistingServer: !process.env.CI,
  },
})

// Capturas de la colección de regalos: cerrada, a mitad de cada apertura, abierta y cada diálogo.
// Uso: npx vite preview --port 4173 (en otra terminal) → node scripts/capturas-regalos.mjs
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:4173/feliz-cumple-isa/'
const SALIDA = process.env.SALIDA ?? 'capturas/regalos'
mkdirSync(SALIDA, { recursive: true })
const navegador = await chromium.launch()

for (const ancho of (process.env.ANCHOS ?? '375,1440').split(',').map(Number)) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: ancho < 500 ? 812 : 900 } })
  const errores = []
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
  pagina.on('pageerror', (e) => errores.push(String(e)))
  await pagina.goto(URL, { waitUntil: 'networkidle' })
  const seccion = pagina.locator('section[aria-labelledby="titulo-regalos"]')
  await seccion.scrollIntoViewIfNeeded()
  await pagina.evaluate(() => window.scrollBy(0, 200))
  await pagina.waitForTimeout(1200)
  await seccion.screenshot({ path: `${SALIDA}/${ancho}-coleccion-cerrada.png` })

  const paquetes = await pagina.getByRole('button', { name: /^Abrir regalo/ }).all()
  for (let i = 0; i < paquetes.length; i++) {
    const p = pagina.getByRole('button', { name: /^Abrir regalo/ }).first()
    await p.scrollIntoViewIfNeeded()
    const caja = await p.boundingBox()
    const zona = { x: Math.max(0, caja.x - 120), y: Math.max(0, caja.y - 220), width: Math.min(ancho - Math.max(0, caja.x - 120), caja.width + 240), height: caja.height + 300 }
    await p.click()
    await pagina.waitForTimeout(ancho < 500 ? 380 : 450)
    await pagina.screenshot({ path: `${SALIDA}/${ancho}-regalo${i + 1}-a.png`, clip: zona })
    await pagina.waitForTimeout(350)
    await pagina.screenshot({ path: `${SALIDA}/${ancho}-regalo${i + 1}-b.png`, clip: zona })
    await pagina.getByRole('dialog').waitFor({ state: 'visible', timeout: 4000 })
    await pagina.waitForTimeout(1500)
    await pagina.screenshot({ path: `${SALIDA}/${ancho}-regalo${i + 1}-dialogo.png` })
    await pagina.keyboard.press('Escape')
    await pagina.waitForTimeout(300)
  }
  await seccion.scrollIntoViewIfNeeded()
  await pagina.waitForTimeout(400)
  await seccion.screenshot({ path: `${SALIDA}/${ancho}-coleccion-abierta.png` })
  const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`${ancho}px · ${paquetes.length} regalos · desborde ${desborde}px · errores: ${errores.join(' | ') || 'ninguno'}`)
  await pagina.close()
}
await navegador.close()

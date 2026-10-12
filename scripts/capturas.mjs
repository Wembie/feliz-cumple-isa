// Capturas de las cuatro secciones a varios anchos para revisar el diseño real.
// Uso: npm run build && npx vite preview --port 4173  (en otra terminal)  →  node scripts/capturas.mjs
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:4173/feliz-cumple-isa/'
const ANCHOS = (process.env.ANCHOS ?? '375,390,768,1440').split(',').map(Number)
const SALIDA = process.env.SALIDA ?? 'capturas'
mkdirSync(SALIDA, { recursive: true })

const navegador = await chromium.launch()
for (const ancho of ANCHOS) {
  const alto = ancho < 500 ? 812 : ancho < 1000 ? 1024 : 900
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, reducedMotion: process.env.REDUCIDO ? 'reduce' : 'no-preference' })
  const errores = []
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
  pagina.on('pageerror', (e) => errores.push(String(e)))
  await pagina.goto(URL, { waitUntil: 'networkidle' })
  await pagina.waitForTimeout(1800)
  await pagina.screenshot({ path: `${SALIDA}/${ancho}-1-entrada.png` })

  const secciones = [
    ['2-deseo', '#deseo'],
    ['3-mundo', 'section[aria-labelledby="titulo-mundo"]'],
    ['4-carta', 'section[aria-labelledby="titulo-carta"]'],
    ['5-cierre', 'section[aria-labelledby="titulo-cierre"]'],
  ]
  // Recorre la página para que las piezas que aparecen al entrar en pantalla se coloquen.
  await pagina.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
  })
  await pagina.waitForTimeout(800)
  for (const [nombre, selector] of secciones) {
    const el = pagina.locator(selector)
    await el.scrollIntoViewIfNeeded()
    await pagina.waitForTimeout(900)
    await el.screenshot({ path: `${SALIDA}/${ancho}-${nombre}.png` })
  }
  // Estados tras interactuar: velas apagadas y carta abierta.
  for (const vela of await pagina.getByRole('button', { name: /^Vela \d/ }).all()) await vela.dispatchEvent('click')
  await pagina.waitForTimeout(1400)
  await pagina.locator('#deseo').screenshot({ path: `${SALIDA}/${ancho}-6-deseo-exito.png` })
  await pagina.getByRole('button', { name: /Abrir la carta/ }).click()
  await pagina.waitForTimeout(2600)
  await pagina.locator('section[aria-labelledby="titulo-carta"]').screenshot({ path: `${SALIDA}/${ancho}-7-carta-abierta.png` })

  const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`${ancho}px · desborde horizontal: ${desborde}px · errores: ${errores.length ? errores.join(' | ') : 'ninguno'}`)
  await pagina.close()
}
await navegador.close()

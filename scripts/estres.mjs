// Comprueba que ningún texto queda cortado, fuera de la pantalla o tapado por otro elemento.
// Uso:
//   npm run estres                → textos alargados (dist-estres), varios anchos
//   node scripts/estres.mjs dist  → los textos reales de constantes.ts (tras npm run build)
// Termina con código 1 si encuentra problemas. Guarda capturas en capturas/estres/.
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const CARPETA = process.argv[2] ?? 'dist-estres'
const PUERTO = { dist: 4175, 'dist-real': 4176 }[CARPETA] ?? 4174
const URL = `http://localhost:${PUERTO}/feliz-cumple-isa/`
const ANCHOS = (process.env.ANCHOS ?? '320,375,390,768,1440').split(',').map(Number)
const SALIDA = `capturas/estres/${CARPETA}`
mkdirSync(SALIDA, { recursive: true })

const servidor = spawn('npx', ['vite', 'preview', '--outDir', CARPETA, '--port', String(PUERTO), '--strictPort'], { shell: true, stdio: 'ignore' })
const esperar = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(URL)).ok) return
    } catch {
      /* todavía arrancando */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('El servidor de vista previa no arrancó')
}

/** Corre dentro de la página: revisa los textos visibles en la ventana actual. */
function revisarVentana() {
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const problemas = []
  const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let nodo = caminante.nextNode(); nodo; nodo = caminante.nextNode()) {
    const texto = nodo.textContent.trim()
    const el = nodo.parentElement
    if (!texto || !el || el.closest('.solo-lectores, [data-marquesina], dialog:not([open]), noscript, script, style, svg')) continue
    // Ignora lo invisible (opacidad 0 o visibility hidden en algún ancestro).
    let invisible = false
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a)
      const oculto = cs.clip === 'rect(0px, 0px, 0px, 0px)' || (cs.position === 'absolute' && a.offsetWidth <= 1)
      if (oculto || cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) {
        invisible = true
        break
      }
    }
    if (invisible) continue
    const rango = document.createRange()
    rango.selectNodeContents(nodo)
    for (const r of rango.getClientRects()) {
      if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > vh) continue
      const etiqueta = `"${texto.slice(0, 50)}"`
      // 1 · Fuera de la pantalla a lo ancho
      if (r.left < -2 || r.right > vw + 2) problemas.push(`fuera de pantalla: ${etiqueta}`)
      // 2 · Recortado por un contenedor con overflow oculto
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
        const c = a.getBoundingClientRect()
        if (r.left < c.left - 2 || r.right > c.right + 2 || r.top < c.top - 2 || r.bottom > c.bottom + 2) {
          problemas.push(`recortado: ${etiqueta}`)
          break
        }
      }
      // 3 · Tapado por otro elemento (se mira el centro de cada línea)
      const x = Math.min(vw - 1, Math.max(0, r.left + r.width / 2))
      const y = Math.min(vh - 1, Math.max(0, r.top + r.height / 2))
      if (r.top >= 0 && r.bottom <= vh) {
        const arriba = document.elementFromPoint(x, y)
        // No cuentan los elementos invisibles ni los flotantes (fijos, como el botón de sonido).
        let tapaInvisible = false
        for (let a = arriba; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a)
          if (parseFloat(cs.opacity) < 0.05 || cs.position === 'fixed') tapaInvisible = true
        }
        if (arriba && !tapaInvisible && !el.contains(arriba) && !arriba.contains(el) && !arriba.closest('[data-solapable]') && !el.closest('[data-solapable]')) {
          problemas.push(`tapado por <${arriba.tagName.toLowerCase()} class="${String(arriba.className).slice(0, 40)}">: ${etiqueta}`)
        }
      }
    }
  }
  return problemas
}

let total = 0
try {
  await esperar()
  const navegador = await chromium.launch()
  for (const ancho of ANCHOS) {
    const alto = ancho < 500 ? 740 : ancho < 1000 ? 1024 : 900
    const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } })
    const errores = []
    pagina.on('pageerror', (e) => errores.push(String(e)))
    pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
    await pagina.goto(URL, { waitUntil: 'networkidle' })
    await pagina.waitForTimeout(2200) // caída de las letras y entrada del póster

    // Abre lo que se abre (carta y velas) para revisar también esos estados.
    await pagina.getByRole('button', { name: /Abrir la carta/ }).click().catch(() => {})
    await pagina.getByRole('button', { name: /Soplar todas/ }).click().catch(() => {})
    await pagina.waitForTimeout(3000)

    const problemas = new Set()
    const altoTotal = await pagina.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < altoTotal; y += Math.floor(alto * 0.8)) {
      await pagina.evaluate((y) => window.scrollTo(0, y), y)
      await pagina.waitForTimeout(1100) // deja terminar las apariciones del collage y los regalos
      for (const p of await pagina.evaluate(revisarVentana)) problemas.add(p)
    }
    const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (desborde > 0) problemas.add(`scroll horizontal de ${desborde}px`)
    errores.forEach((e) => problemas.add(`error: ${e}`))

    await pagina.evaluate(() => window.scrollTo(0, 0))
    await pagina.waitForTimeout(200)
    await pagina.screenshot({ path: `${SALIDA}/${ancho}-pagina.png`, fullPage: true })
    console.log(`\n${ancho}px · ${problemas.size === 0 ? '✓ sin problemas' : `${problemas.size} problemas`}`)
    for (const p of problemas) console.log(`  · ${p}`)
    total += problemas.size
    await pagina.close()
  }
  await navegador.close()
} finally {
  servidor.kill()
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(servidor.pid), '/t', '/f'], { stdio: 'ignore' })
}
process.exit(total > 0 ? 1 : 0)

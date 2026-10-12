/**
 * Dibuja la imagen de la vista previa del enlace (1200 × 630) con los textos de src/vistaPrevia.ts.
 * Uso: npm run vista-previa  →  public/vista-previa.png
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { VISTA_PREVIA } from '../src/vistaPrevia'

const ANCHO = 1200
const ALTO = 630
const SALIDA = resolve('public/vista-previa.png')

const fuente = (paquete: string, archivo: string) =>
  `data:font/woff2;base64,${readFileSync(resolve('node_modules/@fontsource-variable', paquete, 'files', archivo)).toString('base64')}`

const escapar = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

// Confeti fijo (siempre sale igual): [x, y, ancho, alto, giro, color, redondo]
const CONFETI: [number, number, number, number, number, string, boolean][] = [
  [70, 70, 34, 14, 28, 'var(--girasol)', false],
  [520, 40, 22, 22, 0, 'var(--menta)', true],
  [690, 120, 38, 14, -32, 'var(--cobalto)', false],
  [40, 330, 20, 20, 0, 'var(--papel)', true],
  [610, 540, 40, 14, 18, 'var(--girasol)', false],
  [1130, 300, 18, 18, 0, 'var(--girasol)', true],
  [1090, 560, 36, 14, -20, 'var(--menta)', false],
  [430, 575, 18, 18, 0, 'var(--chicle)', true],
  [980, 40, 30, 12, 40, 'var(--papel)', false],
  [800, 590, 16, 16, 0, 'var(--papel)', true],
]

const { imagen } = VISTA_PREVIA

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<style>
  @font-face { font-family: 'Bricolage'; src: url(${fuente('bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; }
  @font-face { font-family: 'Instrument'; src: url(${fuente('instrument-sans', 'instrument-sans-latin-wght-normal.woff2')}) format('woff2'); font-weight: 400 700; }
  :root {
    --tomate: #ff4d38; --girasol: #ffd84d; --cobalto: #3455db; --chicle: #ff77b7;
    --menta: #a8e6cf; --papel: #fff5e6; --tinta: #191919;
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: ${ANCHO}px; height: ${ALTO}px; overflow: hidden; position: relative;
    background: var(--tomate);
    background-image: radial-gradient(color-mix(in srgb, var(--papel) 24%, transparent) 2px, transparent 2.6px);
    background-size: 22px 22px;
    font-family: 'Instrument', system-ui, sans-serif; color: var(--tinta);
  }
  .grande {
    position: absolute; left: 70px; top: 150px; white-space: nowrap;
    font: 800 290px/0.86 'Bricolage', 'Arial Black', sans-serif; letter-spacing: -0.04em;
    color: var(--papel); -webkit-text-stroke: 6px var(--tinta); paint-order: stroke fill;
    text-shadow: 14px 14px 0 var(--tinta);
  }
  .cinta {
    position: absolute; left: 40px; top: 92px; transform: rotate(-5deg);
    padding: 14px 34px 12px; background: var(--girasol); border: 5px solid var(--tinta);
    box-shadow: 8px 8px 0 var(--tinta);
    font: 800 46px/1 'Bricolage', sans-serif; text-transform: uppercase; letter-spacing: 0.01em;
  }
  .fecha {
    position: absolute; right: 70px; top: 60px; width: 210px; height: 210px; transform: rotate(12deg);
    display: grid; place-content: center; text-align: center; border-radius: 50%;
    background: var(--chicle); border: 5px solid var(--tinta); box-shadow: 9px 9px 0 var(--tinta);
    font: 800 76px/0.9 'Bricolage', sans-serif;
  }
  .fecha span:last-child { font-size: 44px; letter-spacing: 0.08em; }
  .pie {
    position: absolute; left: 70px; bottom: 54px; transform: rotate(-1.5deg);
    padding: 12px 22px; background: var(--papel); border: 4px solid var(--tinta); border-radius: 12px;
    box-shadow: 6px 6px 0 var(--tinta); font: 700 28px/1 'Instrument', sans-serif; white-space: nowrap;
  }
  .regalo { position: absolute; right: 90px; bottom: 60px; width: 230px; height: 200px; transform: rotate(-6deg); }
  .regalo .caja, .regalo .tapa { position: absolute; border: 5px solid var(--tinta); background: var(--cobalto); }
  .regalo .caja { left: 15px; right: 15px; bottom: 0; height: 150px; box-shadow: 9px 9px 0 var(--tinta);
    background-image: radial-gradient(var(--papel) 5px, transparent 6px); background-size: 34px 34px; }
  .regalo .tapa { left: 0; right: 0; top: 22px; height: 46px; background-color: #4a6be6; }
  .regalo .cinta-v { position: absolute; left: 50%; top: 22px; bottom: 0; width: 34px; margin-left: -17px; background: var(--girasol); border: 5px solid var(--tinta); }
  .regalo .mono { position: absolute; left: 50%; top: -14px; width: 120px; height: 52px; margin-left: -60px; }
  .regalo .mono i { position: absolute; top: 0; width: 58px; height: 46px; background: var(--girasol); border: 5px solid var(--tinta); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; }
  .regalo .mono i:first-child { left: 0; transform: rotate(-18deg); }
  .regalo .mono i:last-child { right: 0; transform: rotate(18deg); }
  .papelito { position: absolute; border: 3px solid var(--tinta); }
</style></head>
<body>
  ${CONFETI.map(([x, y, w, h, g, c, r]) => `<i class="papelito" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${g}deg);background:${c};border-radius:${r ? '50%' : '3px'}"></i>`).join('\n  ')}
  <div class="regalo"><span class="caja"></span><span class="cinta-v"></span><span class="tapa"></span><span class="mono"><i></i><i></i></span></div>
  <div class="grande" id="grande">${escapar(imagen.grande)}</div>
  <div class="cinta">${escapar(imagen.cinta)}</div>
  <div class="fecha">${imagen.fecha.map((l) => `<span>${escapar(l)}</span>`).join('')}</div>
  <div class="pie" id="pie">${escapar(imagen.pie)}</div>
  <script>
    // Los textos se encogen hasta caber sin tapar el sticker de la fecha ni el regalo.
    document.fonts.ready.then(function () {
      [['grande', 900, 90], ['pie', 850, 16]].forEach(function (a) {
        var el = document.getElementById(a[0]);
        var tam = parseFloat(getComputedStyle(el).fontSize);
        while (el.getBoundingClientRect().right > a[1] && tam > a[2]) el.style.fontSize = --tam + 'px';
      });
      window.listo = true;
    });
  </script>
</body></html>`

const navegador = await chromium.launch()
try {
  const pagina = await navegador.newPage({ viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 1 })
  await pagina.setContent(html)
  await pagina.waitForFunction('window.listo === true')
  const captura = await pagina.screenshot({ type: 'png' })
  writeFileSync(SALIDA, await sharp(captura).png({ compressionLevel: 9 }).toBuffer())
  console.log(`✓ Vista previa lista: ${SALIDA}`)
} finally {
  await navegador.close()
}

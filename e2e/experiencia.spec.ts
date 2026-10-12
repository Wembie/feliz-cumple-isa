import { expect, test, type Page } from '@playwright/test'
import { CARTA, CIERRE, DESEO, ENTRADA, FOTOS, MUNDO, NOMBRE, STICKERS, literal, visible } from './textos'

const LETRAS = Array.from(ENTRADA.letras)

/** Errores de consola, excepciones y recursos que no cargan (404) durante la prueba. */
function vigilar(pagina: Page) {
  const problemas: string[] = []
  pagina.on('console', (m) => m.type() === 'error' && problemas.push(`consola: ${m.text()}`))
  pagina.on('pageerror', (e) => problemas.push(`excepción: ${e.message}`))
  pagina.on('response', (r) => r.status() >= 400 && problemas.push(`${r.status()} ${r.url()}`))
  return problemas
}

/** Toca cada vela como lo haría Isa: sobre la parte visible de su llama (con varias filas, se solapan). */
async function apagarTocando(pagina: Page) {
  const puntos = await pagina.evaluate(() =>
    [...document.querySelectorAll<HTMLButtonElement>('#deseo button[aria-label^="Vela"]')].map((btn) => {
      const r = btn.querySelector('[data-toque]')!.getBoundingClientRect()
      for (let y = r.top; y < r.bottom; y += 2)
        for (let x = r.left; x < r.right; x += 2) if (document.elementFromPoint(x, y)?.closest('button') === btn) return [x + 2, y + 2]
      return null
    }),
  )
  for (const punto of puntos) {
    expect(punto, 'cada vela debe tener una parte visible que se pueda tocar').not.toBeNull()
    await pagina.mouse.click(punto![0], punto![1])
  }
}

/** Transformación de una letra quieta en su sitio. */
const EN_REPOSO = /translate3d\(0(\.00)?px, 0(\.00)?px/

/** ¿El lienzo de confeti tiene algo dibujado ahora mismo? */
async function hayConfeti(pagina: Page) {
  return pagina.evaluate(() => {
    const lienzo = document.querySelector<HTMLCanvasElement>('canvas[aria-hidden="true"]')
    const ctx = lienzo?.getContext('2d')
    if (!lienzo || !ctx || lienzo.width === 0) return false
    const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data
    for (let i = 3; i < datos.length; i += 4 * 97) if (datos[i]! > 0) return true
    return false
  })
}

test('la entrada saluda a Isa desde el primer momento, sin errores ni scroll horizontal', async ({ page }) => {
  const problemas = vigilar(page)
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(visible(ENTRADA.saludo))
  await expect(page.getByRole('heading', { level: 1 })).toContainText(NOMBRE)
  await expect(page.getByRole('group', { name: literal(`Letras de ${ENTRADA.letras}`) }).getByRole('button')).toHaveCount(LETRAS.length)
  await page.waitForLoadState('networkidle')
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(desborde).toBe(0)
  expect(problemas).toEqual([])
})

test('las letras saltan al tocarlas y vuelven a su sitio tras arrastrarlas', async ({ page, isMobile }) => {
  await page.goto('./')
  const letra = page.getByRole('button', { name: literal(`Letra ${LETRAS[1]}:`) })
  await page.waitForTimeout(1500) // fin de la caída inicial
  await letra.click()
  await expect.poll(() => letra.evaluate((el) => el.style.transform)).toMatch(EN_REPOSO)

  if (!isMobile) {
    const caja = (await letra.boundingBox())!
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
    await page.mouse.down()
    await page.mouse.move(caja.x + caja.width / 2 + 160, caja.y + caja.height / 2 + 40, { steps: 8 })
    const durante = await letra.evaluate((el) => el.style.transform)
    expect(durante).not.toMatch(EN_REPOSO)
    await page.mouse.up()
    await expect.poll(() => letra.evaluate((el) => el.style.transform), { timeout: 5000 }).toMatch(EN_REPOSO)
  }
})

test('se puede jugar con las letras con el teclado', async ({ page }) => {
  await page.goto('./')
  const letra = page.getByRole('button', { name: literal(`Letra ${LETRAS[0]}:`) })
  await letra.focus()
  await expect(letra).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: literal(`Letra ${LETRAS[1]}:`) })).toBeFocused()
})

test('apagar todas las velas tocándolas dispara la celebración', async ({ page }) => {
  await page.goto('./')
  const velas = page.getByRole('button', { name: /^Vela \d/ })
  await expect(velas).toHaveCount(DESEO.velas)
  await velas.first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await apagarTocando(page)
  await expect(page.getByText(visible(DESEO.contadorQueda))).toHaveCount(0)
  await expect(page.locator('#deseo [aria-live]')).toContainText(visible(DESEO.exitoSticker), { timeout: 3000 })
  await expect.poll(() => hayConfeti(page)).toBe(true)
  // El confeti se limpia solo.
  await expect.poll(() => hayConfeti(page), { timeout: 12000 }).toBe(false)
  await page.getByRole('button', { name: visible(DESEO.reencender) }).click()
  await expect(page.locator('#deseo [aria-live]')).toContainText(DESEO.contadorTodas.replace('{n}', String(DESEO.velas)))
})

test('el botón "Soplar todas" es una alternativa sin gestos precisos', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: visible(DESEO.botonSoplarTodas) }).click()
  await expect(page.locator('#deseo [aria-live]')).toContainText(visible(DESEO.exitoSticker), { timeout: 6000 })
})

test('las fotos se abren, se voltean para leer su nota y se cierran', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /Abrir foto 1/ }).click()
  const visor = page.getByRole('dialog')
  await expect(visor).toBeVisible()
  await visor.getByRole('button', { name: visible(MUNDO.botonLeerNota), exact: true }).click()
  await expect(visor.getByRole('button', { name: visible(MUNDO.botonVerFoto), exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(visor.getByText(visible(FOTOS[0]!.nota))).toBeVisible()
  await visor.getByRole('button', { name: 'Foto siguiente' }).click()
  await expect(visor).toHaveAttribute('aria-label', /Foto 2 de/)
  await page.keyboard.press('Escape')
  await expect(visor).toBeHidden()
})

test('los stickers se despegan y revelan su secreto', async ({ page }) => {
  await page.goto('./')
  const sticker = page.locator('button[aria-expanded]').filter({ hasText: visible(STICKERS[0]!.frente) })
  await sticker.click()
  await expect(sticker).toHaveAttribute('aria-expanded', 'true')
  await expect(sticker).toContainText(visible(STICKERS[0]!.secreto))
})

test('la carta se abre y queda entera a la vista; el cierre repite el confeti', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /Abrir la carta/ }).click()
  const carta = page.getByRole('article', { name: literal(`Carta para ${NOMBRE}`) })
  await expect(carta).toBeVisible({ timeout: 4000 })
  await expect(carta).toContainText(visible(CARTA.saludo))
  await expect(carta).toBeFocused()

  await page.getByRole('heading', { name: visible(CIERRE.frase) }).scrollIntoViewIfNeeded()
  await expect.poll(() => hayConfeti(page)).toBe(true)
  await expect.poll(() => hayConfeti(page), { timeout: 12000 }).toBe(false)
  await page.getByRole('button', { name: visible(CIERRE.boton) }).click()
  await expect.poll(() => hayConfeti(page)).toBe(true)
  // La página no se reinicia: la carta sigue abierta.
  await expect(carta).toBeVisible()
})

test('el sonido empieza activado, se puede silenciar y se recuerda', async ({ page }) => {
  await page.goto('./')
  const boton = page.getByRole('button', { name: 'Sonido' })
  await expect(boton).toHaveAttribute('aria-pressed', 'true')
  await boton.click()
  await expect(boton).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Sonido' })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'Sonido' }).click()
  await expect(page.getByRole('button', { name: 'Sonido' })).toHaveAttribute('aria-pressed', 'true')
})

test.describe('aunque el celular pida reducir movimiento', () => {
  test.use({ reducedMotion: 'reduce' })

  test('se ven todos los efectos igual', async ({ page }) => {
    const problemas = vigilar(page)
    await page.goto('./')
    // Las letras caen igual (empiezan fuera de su sitio)…
    await expect.poll(() => page.getByRole('button', { name: literal(`Letra ${LETRAS[2] ?? LETRAS[0]}:`) }).first().evaluate((el) => el.style.transform)).not.toBe('')
    // …el pastel celebra con confeti…
    await page.getByRole('button', { name: visible(DESEO.botonSoplarTodas) }).click()
    await expect(page.locator('#deseo [aria-live]')).toContainText(visible(DESEO.exitoSticker), { timeout: 6000 })
    await expect.poll(() => hayConfeti(page)).toBe(true)
    // …y el sobre se abre con su animación (no de golpe).
    await page.getByRole('button', { name: /Abrir la carta/ }).click()
    await expect(page.getByRole('article', { name: literal(`Carta para ${NOMBRE}`) })).toBeHidden()
    await expect(page.getByRole('article', { name: literal(`Carta para ${NOMBRE}`) })).toBeVisible({ timeout: 4000 })
    expect(problemas).toEqual([])
  })
})

test('las ediciones por año se eligen con el hash y caen en la más reciente', async ({ page }) => {
  await page.goto('./#/2026')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(NOMBRE)
  await page.goto('./#/1999')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(NOMBRE)
})

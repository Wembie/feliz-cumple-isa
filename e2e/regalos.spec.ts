import { expect, test, type Page } from '@playwright/test'
import { REGALO_REAL, REGALOS, contenido, textoAlAbrir, visible } from './textos'

const LISTA = contenido.regalos.lista
const numeroDe = (id: string) => LISTA.findIndex((r) => r.id === id) + 1

function vigilar(pagina: Page) {
  const problemas: string[] = []
  pagina.on('console', (m) => m.type() === 'error' && problemas.push(`consola: ${m.text()}`))
  pagina.on('pageerror', (e) => problemas.push(`excepción: ${e.message}`))
  pagina.on('response', (r) => r.status() >= 400 && problemas.push(`${r.status()} ${r.url()}`))
  return problemas
}

const regalo = (pagina: Page, n: number) => pagina.getByRole('button', { name: new RegExp(`^Abrir regalo ${n} de ${LISTA.length}`) })

// Lo que debe aparecer al abrir cada paquete del contenido por defecto (marcadores pendientes).
const ESPERADO: [n: number, texto: string][] = LISTA.map((r, i) => [i + 1, textoAlAbrir(r)])

test('cada regalo se abre (clic o toque) y muestra su contenido; se cierra y se puede volver a ver', async ({ page, isMobile }) => {
  const problemas = vigilar(page)
  await page.goto('./')
  for (const [n, texto] of ESPERADO) {
    const paquete = regalo(page, n)
    await paquete.scrollIntoViewIfNeeded()
    if (isMobile) await paquete.tap()
    else await paquete.click()
    const visor = page.getByRole('dialog')
    await expect(visor).toBeVisible({ timeout: 4000 })
    await expect(visor).toContainText(texto)
    await visor.getByRole('button', { name: visible(REGALOS.botonCerrar) }).click()
    await expect(visor).toBeHidden()
  }
  await expect(page.getByText(`${LISTA.length} ${REGALOS.contadorDe} ${LISTA.length} ${REGALOS.contadorAbiertos}`)).toBeVisible()

  // Un regalo ya abierto se vuelve a consultar sin repetir la animación.
  await page.getByRole('button', { name: /^Volver a ver:/ }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 500 })
  await page.keyboard.press('Escape')
  expect(problemas).toEqual([])
})

test('se abre con el teclado y el foco vuelve al paquete al cerrar', async ({ page }) => {
  await page.goto('./')
  const paquete = regalo(page, 1)
  await paquete.focus()
  await page.keyboard.press('Enter')
  const visor = page.getByRole('dialog')
  await expect(visor).toBeVisible({ timeout: 4000 })
  await expect(visor.getByRole('button', { name: 'Cerrar' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(visor).toBeHidden()
  await expect(page.getByRole('button', { name: /^Volver a ver:/ })).toBeFocused()
})

test('el regalo principal es una caja con regalos dentro; luego se puede volver a ver', async ({ page }) => {
  await page.goto('./')
  const principal = numeroDe('regalo-real')
  await regalo(page, principal).scrollIntoViewIfNeeded()
  await regalo(page, principal).click()
  const visor = page.getByRole('dialog')
  await expect(visor).toBeVisible({ timeout: 5000 })
  await expect(visor.getByText(visible(REGALO_REAL.titulo))).toBeVisible()
  await expect(visor).toContainText(visible(REGALO_REAL.dentroTitulo))
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: visible(REGALOS.botonVolverAVer) }).click()
  await expect(visor).toBeVisible({ timeout: 500 })
})

test('mientras un paquete se abre, tocar otro no abre dos a la vez', async ({ page }) => {
  await page.goto('./')
  await regalo(page, 1).scrollIntoViewIfNeeded()
  await regalo(page, 1).click()
  await regalo(page, 2).click({ force: true })
  const visor = page.getByRole('dialog')
  await expect(visor).toBeVisible({ timeout: 4000 })
  await expect(visor).toContainText(textoAlAbrir(LISTA[0]!))
  await page.keyboard.press('Escape')
  await expect(regalo(page, 2)).toBeVisible()
})

test.describe('aunque el celular pida reducir movimiento', () => {
  test.use({ reducedMotion: 'reduce' })

  test('el regalo se abre con su animación completa', async ({ page }) => {
    const problemas = vigilar(page)
    await page.goto('./')
    await regalo(page, 1).scrollIntoViewIfNeeded()
    await regalo(page, 1).click()
    await expect(page.locator('[data-estado="abriendo"]')).toHaveCount(1)
    await expect(page.getByRole('dialog')).toContainText(textoAlAbrir(LISTA[0]!), { timeout: 4000 })
    expect(problemas).toEqual([])
  })
})

test('dentro del regalo real hay más regalos, y cada uno se abre por separado', async ({ page }) => {
  const dentro = REGALO_REAL.dentro
  test.skip(!dentro || dentro.length === 0, 'la plantilla no tiene regalos dentro')
  await page.goto('./')
  const principal = numeroDe('regalo-real')
  await regalo(page, principal).scrollIntoViewIfNeeded()
  await regalo(page, principal).click()
  const visor = page.getByRole('dialog')
  await expect(visor).toContainText(visible(REGALO_REAL.dentroTitulo), { timeout: 6000 })
  const internos = visor.getByRole('button', { name: new RegExp(`^Abrir regalo [0-9]+ de ${dentro.length}`) })
  await expect(internos).toHaveCount(dentro.length)
  for (const [i, interno] of dentro.entries()) {
    await visor.getByRole('button', { name: new RegExp(`^Abrir regalo ${i + 1} de ${dentro.length}`) }).click()
    await expect(visor).toContainText(textoAlAbrir(interno), { timeout: 4000 })
  }
  // Ya abiertos, se pueden volver a ver.
  await expect(visor.getByRole('button', { name: /^Volver a ver:/ })).toHaveCount(dentro.length)

  // Al salir y volver a entrar, siguen abiertos (hasta recargar la página).
  await page.keyboard.press('Escape')
  await expect(visor).toBeHidden()
  await page.getByRole('button', { name: visible(REGALOS.botonVolverAVer) }).click()
  await expect(visor.getByRole('button', { name: /^Volver a ver:/ })).toHaveCount(dentro.length)
  await expect(visor).toContainText(textoAlAbrir(dentro.at(-1)!))
  await page.reload()
  await regalo(page, principal).scrollIntoViewIfNeeded()
  await regalo(page, principal).click()
  await expect(visor.getByRole('button', { name: new RegExp(`^Abrir regalo [0-9]+ de ${dentro.length}`) })).toHaveCount(dentro.length, { timeout: 6000 })
})

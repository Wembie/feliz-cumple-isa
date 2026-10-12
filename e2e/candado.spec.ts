import { expect, test } from '@playwright/test'
import { CANDADO } from '../src/ediciones/2026/candado'
import { ENTRADA, visible } from './textos'

// La página de pruebas lleva la plantilla cifrada con la clave "clave-de-prueba" (npm run build:prueba).
// `?candado` muestra el candado igual que en la página publicada.

test('antes de la palabra secreta no se muestra nada del regalo', async ({ page }) => {
  await page.goto('./?candado')
  await expect(page.getByRole('heading', { name: CANDADO.titulo })).toBeVisible()
  await expect(page.getByText(visible(ENTRADA.esloganDestacado))).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Vela/ })).toHaveCount(0)
})

test('una palabra incorrecta no abre; la correcta sí, y se recuerda en el dispositivo', async ({ page }) => {
  await page.goto('./?candado')
  const campo = page.getByPlaceholder(CANDADO.campo)
  await campo.fill('no es esta')
  await page.getByRole('button', { name: CANDADO.boton }).click()
  await expect(page.getByRole('alert')).toHaveText(CANDADO.error)

  await campo.fill('clave-de-prueba')
  await page.getByRole('button', { name: CANDADO.boton }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(visible(ENTRADA.saludo), { timeout: 15000 })

  // Vuelve a entrar: con la llave recordada no pide la palabra.
  await page.goto('./?candado=recordar')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(visible(ENTRADA.saludo), { timeout: 15000 })
  await expect(page.getByPlaceholder(CANDADO.campo)).toHaveCount(0)

  // Con `?candado` se vuelve a pedir, para poder probarlo.
  await page.goto('./?candado')
  await expect(page.getByPlaceholder(CANDADO.campo)).toBeVisible()
})

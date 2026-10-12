import * as constantes from '@constantes-2026'
import type { Constantes2026 } from './contenido'

/**
 * Solo en `npm run dev` y en las pruebas: los textos se leen directamente, sin candado
 * (en dev, de privado/2026/constantes.ts; en pruebas, de la plantilla pública).
 * Añade `?candado` a la dirección para ver la pantalla de la palabra secreta.
 */
const verCandado = typeof location !== 'undefined' && new URLSearchParams(location.search).has('candado')

export const constantesDirectas: Constantes2026 | null = verCandado ? null : { ...constantes }

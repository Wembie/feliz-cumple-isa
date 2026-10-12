import type { ComponentType } from 'react'

/**
 * Una edición por cumpleaños (cada 8 de noviembre).
 * Cada año vive en su propia carpeta, con su contenido y su propio diseño,
 * y se carga de forma diferida: sumar años no hace más pesada la página.
 */
export interface PropsEdicion {
  /** Las otras ediciones, para enlazarlas discretamente en el pie. */
  otras: readonly { anio: number; titulo: string }[]
}

export interface Edicion {
  anio: number
  titulo: string
  cargar: () => Promise<{ default: ComponentType<PropsEdicion> }>
}

export const EDICIONES: readonly Edicion[] = [
  { anio: 2026, titulo: 'Edición 2026', cargar: () => import('./2026/Edicion') },
  // { anio: 2027, titulo: 'Edición 2027', cargar: () => import('./2027/Edicion') },
]

const RUTA = /^#\/(\d{4})\/?$/

/** El año pedido en la URL (`#/2026`), o `null` si el hash es otra cosa. */
export function anioDesdeHash(hash: string): number | null {
  const coincidencia = RUTA.exec(hash)
  return coincidencia ? Number(coincidencia[1]) : null
}

/** La edición del año pedido; si no existe (o no se pidió ninguna), la más reciente. */
export function resolverEdicion(anio: number | null, ediciones: readonly Edicion[] = EDICIONES): Edicion {
  if (ediciones.length === 0) throw new Error('No hay ediciones registradas')
  const pedida = anio === null ? undefined : ediciones.find((e) => e.anio === anio)
  return pedida ?? ediciones.reduce((a, b) => (b.anio > a.anio ? b : a))
}

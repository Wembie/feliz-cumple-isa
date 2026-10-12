/** Máximo de velas que admite el pastel. */
export const MAX_VELAS = 30

/** Velas por fila antes de pasar a varias filas. */
const POR_FILA = 6
/** Cuánto sube cada fila de atrás (unidades del dibujo). */
export const ELEVACION_FILA = 26

export function filasDeVelas(cantidad: number): number {
  return Math.ceil(limitarVelas(cantidad) / POR_FILA)
}

export interface PosicionVela {
  /** Centro horizontal, en unidades del dibujo del pastel (0–400). */
  x: number
  /** Desplazamiento hacia arriba de la base, en unidades del dibujo (filas de atrás). */
  elevacion: number
  /** Escala de la vela (las de atrás, algo más pequeñas). */
  escala: number
}

export function limitarVelas(n: number): number {
  return Math.max(1, Math.min(MAX_VELAS, Math.round(n)))
}

/**
 * Coloca las velas sobre el piso superior (x de 95 a 305).
 * Hasta 6 van en una fila; más, en varias filas escalonadas: las de atrás más
 * arriba y más pequeñas, y desfasadas para que no queden tapadas.
 * El orden es de atrás hacia delante, así las de delante se pintan encima.
 */
export function colocarVelas(cantidad: number): PosicionVela[] {
  const n = limitarVelas(cantidad)
  const filas = filasDeVelas(n)
  const base = Math.floor(n / filas)
  const sobrantes = n % filas
  const posiciones: PosicionVela[] = []
  for (let f = 0; f < filas; f++) {
    // f = 0 es la fila de más atrás. Las filas de delante se llevan las velas sobrantes.
    const enFila = base + (f >= filas - sobrantes ? 1 : 0)
    const profundidad = filas - 1 - f
    // Las filas de atrás son un poco más estrechas (perspectiva).
    const desde = 95 + profundidad * 10
    const hasta = 305 - profundidad * 10
    // Filas alternas: repartidas "entre huecos" para asomar entre las de delante.
    const entreHuecos = profundidad % 2 === 1
    for (let i = 0; i < enFila; i++) {
      const x =
        enFila === 1
          ? 200
          : entreHuecos
            ? desde + ((hasta - desde) * (i + 0.5)) / enFila
            : desde + ((hasta - desde) * i) / (enFila - 1)
      posiciones.push({ x, elevacion: profundidad * ELEVACION_FILA, escala: 1 - profundidad * 0.1 })
    }
  }
  return posiciones
}

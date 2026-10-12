import type { AperturaRegalo, Regalo } from '../../compartido/tipos'
import type { Efecto } from '../../compartido/sonido'
import type { OpcionesRafaga } from '../../compartido/Confeti'

export type EstadoRegalo = 'cerrado' | 'abriendo' | 'abierto'

/**
 * Coreografía de cada apertura: duración total (ms) y momentos (0–1) en los que
 * suenan los efectos y sale la ráfaga de confeti. Las animaciones CSS usan las mismas duraciones.
 */
export interface Coreografia {
  duracion: number
  sonidos: [momento: number, efecto: Efecto][]
  rafaga: { momento: number } & OpcionesRafaga
}

const COREOGRAFIAS: Record<AperturaRegalo, Coreografia> = {
  mono: {
    duracion: 1050,
    sonidos: [[0.22, 'cinta'], [0.5, 'tapa']],
    rafaga: { momento: 0.62, cantidad: 45, serpentinas: 3 },
  },
  sorpresa: {
    duracion: 950,
    sonidos: [[0.47, 'tapa'], [0.55, 'pop']],
    rafaga: { momento: 0.52, cantidad: 40, serpentinas: 9, fuerza: 1.15 },
  },
  sobre: {
    duracion: 1000,
    sonidos: [[0.08, 'sticker'], [0.32, 'papel']],
    rafaga: { momento: 0.55, cantidad: 22, serpentinas: 0, fuerza: 0.7 },
  },
  misterio: {
    duracion: 1300,
    sonidos: [[0.05, 'pop'], [0.32, 'pop'], [0.7, 'tapa']],
    rafaga: { momento: 0.72, cantidad: 50, serpentinas: 6 },
  },
}

/** El regalo principal tiene su propia coreografía, más larga y con redoble. */
const DESTACADO: Coreografia = {
  duracion: 1900,
  sonidos: [[0, 'redoble'], [0.38, 'cinta'], [0.58, 'tapa'], [0.64, 'confeti']],
  rafaga: { momento: 0.62, cantidad: 130, serpentinas: 14, fuerza: 1.35 },
}

export function coreografiaDe(regalo: Pick<Regalo, 'apertura' | 'destacado'>): Coreografia {
  return regalo.destacado ? DESTACADO : COREOGRAFIAS[regalo.apertura]
}

/**
 * Orden visual en escritorio: el regalo principal en el centro de la composición.
 * Devuelve el valor de `order` CSS para cada regalo (por índice).
 */
export function ordenEscritorio(lista: readonly Pick<Regalo, 'destacado'>[]): number[] {
  if (!lista.some((r) => r.destacado)) return lista.map((_, i) => i)
  const centro = Math.floor((lista.length - 1) / 2)
  let k = 0
  return lista.map((r) => {
    if (r.destacado) return centro
    const orden = k < centro ? k : k + 1
    k++
    return orden
  })
}

/** Problemas de configuración que conviene detectar antes de publicar. */
export function revisarRegalos(lista: readonly Regalo[]): string[] {
  const problemas: string[] = []
  const ids = new Set<string>()
  for (const r of lista) {
    if (!/^[a-z0-9-]+$/i.test(r.id)) problemas.push(`id inválido: "${r.id}" (usa letras, números y guiones)`)
    if (ids.has(r.id)) problemas.push(`id repetido: "${r.id}"`)
    ids.add(r.id)
  }
  const destacados = lista.filter((r) => r.destacado).length
  if (destacados > 1) problemas.push(`hay ${destacados} regalos destacados; marca solo uno`)
  return problemas
}

import type { Texto } from './tipos'

const PATRON = /\[\[([^\]]*)\]\]/g

/**
 * Marca un texto que todavía hay que escribir.
 * En la página se ve como un marcador "✎ pista" claramente identificable.
 */
export function pendiente(pista: string): Texto {
  return `[[${pista}]]`
}

export function esPendiente(texto: Texto): boolean {
  return texto.includes('[[') && fragmentar(texto).some((f) => f.tipo === 'pendiente')
}

export type Fragmento = { tipo: 'texto'; valor: string } | { tipo: 'pendiente'; pista: string }

export function fragmentar(texto: Texto): Fragmento[] {
  const fragmentos: Fragmento[] = []
  let ultimo = 0
  for (const coincidencia of texto.matchAll(PATRON)) {
    const inicio = coincidencia.index ?? 0
    if (inicio > ultimo) fragmentos.push({ tipo: 'texto', valor: texto.slice(ultimo, inicio) })
    fragmentos.push({ tipo: 'pendiente', pista: coincidencia[1] ?? '' })
    ultimo = inicio + coincidencia[0].length
  }
  if (ultimo < texto.length) fragmentos.push({ tipo: 'texto', valor: texto.slice(ultimo) })
  return fragmentos
}

/** Versión plana para atributos (`alt`, `aria-label`). */
export function textoPlano(texto: Texto, reemplazo = 'pendiente'): string {
  return texto.replace(PATRON, reemplazo).trim()
}

/** Recorre el contenido y devuelve las pistas de todos los marcadores pendientes. */
export function listarPendientes(valor: unknown, ruta = ''): { ruta: string; pista: string }[] {
  if (typeof valor === 'string') {
    return fragmentar(valor)
      .filter((f): f is Extract<Fragmento, { tipo: 'pendiente' }> => f.tipo === 'pendiente')
      .map((f) => ({ ruta, pista: f.pista }))
  }
  if (Array.isArray(valor)) return valor.flatMap((v, i) => listarPendientes(v, `${ruta}[${i}]`))
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([clave, v]) =>
      listarPendientes(v, ruta ? `${ruta}.${clave}` : clave),
    )
  }
  return []
}

/** Fotos sin archivo todavía (src `null`). */
export function contarFotosPendientes(fotos: readonly { src: string | null }[]): number {
  return fotos.filter((f) => f.src === null).length
}

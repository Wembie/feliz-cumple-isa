/**
 * Utilidades para cartas largas: convertir un texto libre en párrafos
 * y repartirlos en hojas de un máximo de caracteres.
 */

/** Separa un texto en párrafos: una línea en blanco = párrafo nuevo. Los saltos simples se unen. */
export function separarParrafos(texto: string): string[] {
  return texto
    .split(/\n[ \t]*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

/** Parte un párrafo demasiado largo: primero por frases y, si una frase no cabe, por palabras. */
export function partirParrafo(parrafo: string, maximo: number): string[] {
  if (parrafo.length <= maximo) return [parrafo]
  const frases = parrafo.split(/(?<=[.!?…])\s+/)
  const piezas: string[] = []
  let actual = ''
  const empujar = (trozo: string) => {
    if (!actual) actual = trozo
    else if (actual.length + 1 + trozo.length <= maximo) actual += ` ${trozo}`
    else {
      piezas.push(actual)
      actual = trozo
    }
  }
  for (const frase of frases) {
    if (frase.length <= maximo) empujar(frase)
    else for (const palabra of frase.split(/\s+/)) empujar(palabra)
  }
  if (actual) piezas.push(actual)
  return piezas
}

/**
 * Reparte los párrafos en hojas sin pasar de `maximo` caracteres por hoja
 * (salvo que una sola palabra sea más larga). Siempre devuelve al menos una hoja.
 */
export function paginar(parrafos: readonly string[], maximo: number): string[][] {
  const limite = Math.max(80, Math.floor(maximo))
  const hojas: string[][] = [[]]
  let usados = 0
  for (const parrafo of parrafos) {
    for (const trozo of partirParrafo(parrafo, limite)) {
      if (usados > 0 && usados + trozo.length > limite) {
        hojas.push([])
        usados = 0
      }
      hojas[hojas.length - 1]!.push(trozo)
      usados += trozo.length
    }
  }
  return hojas
}

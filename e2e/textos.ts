/**
 * Las pruebas leen los textos de la plantilla pública con la que se construye la página de pruebas.
 */
import { separarParrafos } from '../src/compartido/carta'
import type { Regalo } from '../src/compartido/tipos'
import * as plantilla from '../src/ediciones/2026/constantes.ejemplo'
import { crearContenido } from '../src/ediciones/2026/contenido'

// Las pruebas usan la plantilla pública (la página de pruebas se construye con ella).
export * from '../src/ediciones/2026/constantes.ejemplo'
export const contenido = crearContenido({ ...plantilla })

/** Cómo se ve un texto en la página: los marcadores `pendiente('x')` se muestran como "✎ x". */
export function visible(texto: string): string {
  return texto.replace(/\[\[(.*?)\]\]/g, '$1').replace(/\s+/g, ' ').trim()
}

/** Expresión regular que busca un texto literal (escapa sus símbolos). */
export function literal(texto: string): RegExp {
  return new RegExp(texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

/** Un texto que debe aparecer al abrir cada regalo, según su tipo de contenido. */
export function textoAlAbrir(regalo: Regalo): string {
  const c = regalo.contenido
  switch (c.tipo) {
    case 'mensaje':
      return visible(c.texto)
    case 'foto':
      return visible(c.pie)
    case 'carta':
      return visible(separarParrafos(c.parrafos.join('\n\n'))[0] ?? c.saludo)
    case 'video':
      return visible(c.descripcion)
    case 'fisico':
      return visible(c.nombre)
    case 'personalizada':
      return visible(c.titulo)
    case 'caja':
      return visible(c.titulo)
  }
}

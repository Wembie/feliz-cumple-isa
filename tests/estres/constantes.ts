/**
 * Constantes "de estrés": los mismos textos de la edición 2026, pero mucho más largos.
 * Solo se usan en `npm run estres` (vite build --mode estres) para comprobar que
 * la página se adapta a cualquier texto que se escriba en constantes.ts.
 */
import * as R from '../../src/ediciones/2026/constantes.ejemplo'

const NO_TOCAR = new Set(['src', 'formato', 'color', 'archivo', 'portada', 'subtitulos', 'dia', 'mes', 'anio', 'larga'])

function alargar<T>(valor: T, clave = ''): T {
  if (typeof valor === 'string') {
    if (NO_TOCAR.has(clave) || valor.trim() === '') return valor
    return `${valor} ${valor.replace('{n}', '').trim()} extra larguísimo`.trim() as T
  }
  if (Array.isArray(valor)) return valor.map((v) => alargar(v, clave)) as T
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, alargar(v, k)])) as T
  }
  return valor
}

const parrafoLargo =
  'Isa, este es un párrafo de prueba bastante largo para comprobar que la carta se reparte en varias hojas sin cortar nada. ' +
  'Tiene varias frases seguidas, algunas palabras larguísimas como electroencefalografistas o anticonstitucionalmente, y sigue y sigue. '

export const NOMBRE = 'Isabella María'
export const FECHA = R.FECHA
export const SONIDO = alargar(R.SONIDO)
export const ENTRADA = { ...alargar(R.ENTRADA), letras: 'ISABELITA!' }
export const DESEO = { ...alargar(R.DESEO), velas: 30, textoPastel: 'ISABELITA', contadorTodas: '{n} velas encendidas todavía en el pastel', contadorQuedan: 'Todavía quedan {n} velitas por apagar' }
export const MUNDO = { ...alargar(R.MUNDO), tituloGrande: 'pequeñísimo', tituloEtiqueta: 'mundo compartido' }
export const FOTOS = alargar(R.FOTOS)
export const STICKERS = alargar(R.STICKERS)
export const NOTAS = alargar(R.NOTAS)
export const CARTA = {
  ...alargar(R.CARTA),
  texto: Array.from({ length: 6 }, () => parrafoLargo.repeat(2)).join('\n\n'),
  caracteresPorHoja: R.CARTA.caracteresPorHoja,
  posdata: 'P. D.: una posdata también bastante larga para ver cómo se acomoda al final de la última hoja de la carta.',
}
export const REGALOS = { ...alargar(R.REGALOS), tituloGrande: 'muchísimo' }
export const REGALO_MENSAJE = alargar(R.REGALO_MENSAJE)
export const REGALO_FOTO = alargar(R.REGALO_FOTO)
export const REGALO_CARTA = alargar(R.REGALO_CARTA)
export const REGALO_REAL = alargar(R.REGALO_REAL)
export const REGALO_VIDEO = alargar(R.REGALO_VIDEO)
export const REGALO_SORPRESA = alargar(R.REGALO_SORPRESA)
export const CIERRE = alargar(R.CIERRE)

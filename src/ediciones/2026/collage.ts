import type { Foto, StickerSecreto, Texto } from '../../compartido/tipos'

export type Pieza =
  | { tipo: 'foto'; foto: Foto; indice: number; sticker: StickerSecreto | undefined }
  | { tipo: 'nota'; texto: Texto; indice: number }

/**
 * Orden del collage: una nota cada dos fotos y un sticker pegado a cada foto.
 * Lo que sobra (notas o stickers) va al final. Funciona con 0, 1 o muchas fotos.
 */
export function componerCollage(fotos: readonly Foto[], notas: readonly Texto[], stickers: readonly StickerSecreto[]) {
  const piezas: Pieza[] = []
  let nota = 0
  fotos.forEach((foto, i) => {
    piezas.push({ tipo: 'foto', foto, indice: i, sticker: stickers[i] })
    if (i % 2 === 1 && nota < notas.length) piezas.push({ tipo: 'nota', texto: notas[nota]!, indice: nota++ })
  })
  while (nota < notas.length) piezas.push({ tipo: 'nota', texto: notas[nota]!, indice: nota++ })
  return { piezas, stickersSueltos: stickers.slice(fotos.length) }
}

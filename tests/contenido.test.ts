import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as plantilla from '../src/ediciones/2026/constantes.ejemplo'
import { crearContenido, type Constantes2026 } from '../src/ediciones/2026/contenido'
import { revisarRegalos } from '../src/ediciones/2026/regalos'

const RUTA_PRIVADA = resolve('privado/2026/constantes.ts')
const FOTOS_PRIVADAS = resolve('privado/2026/fotos')

/** Rutas de archivos (fotos, videos) que menciona el contenido. */
function archivosDe(c: ReturnType<typeof crearContenido>): string[] {
  const rutas = c.mundo.fotos.map((f) => f.src)
  const revisar = (lista: typeof c.regalos.lista) => {
    for (const { contenido: r } of lista) {
      if ((r.tipo === 'foto' || r.tipo === 'fisico' || r.tipo === 'personalizada') && 'imagen' in r) rutas.push(r.imagen?.src ?? null)
      if (r.tipo === 'video') rutas.push(r.src, r.portada, r.subtitulos)
      if (r.tipo === 'caja') revisar(r.regalos)
    }
  }
  revisar(c.regalos.lista)
  return rutas.filter((r): r is string => !!r)
}

function revisar(nombre: string, cargar: () => Promise<Constantes2026>, conArchivos: boolean) {
  describe(nombre, () => {
    it('tiene nombre, letras y fecha del 8 de noviembre', async () => {
      const c = crearContenido(await cargar())
      expect(c.nombre.length).toBeGreaterThan(0)
      expect(c.entrada.letras.length).toBeGreaterThan(0)
      expect(`${c.fecha.dia}/${c.fecha.mes}`).toBe('08/11')
    })

    it('usa un número de velas razonable y un volumen válido', async () => {
      const c = crearContenido(await cargar())
      expect(c.deseo.velas).toBeGreaterThanOrEqual(1)
      expect(c.deseo.velas).toBeLessThanOrEqual(30)
      expect(c.sonido.volumen).toBeGreaterThanOrEqual(0)
      expect(c.sonido.volumen).toBeLessThanOrEqual(1)
    })

    it('la carta tiene al menos un párrafo y los regalos están bien configurados', async () => {
      const c = crearContenido(await cargar())
      expect(c.carta.parrafos.length).toBeGreaterThan(0)
      expect(revisarRegalos(c.regalos.lista)).toEqual([])
      expect(c.regalos.lista.filter((r) => r.destacado)).toHaveLength(1)
    })

    it('se puede guardar como datos (para cifrarlo) sin perder nada', async () => {
      const constantes = { ...(await cargar()) }
      expect(JSON.parse(JSON.stringify(constantes))).toEqual(constantes)
    })

    if (conArchivos) {
      it('las fotos y videos que nombra existen en privado/2026/fotos/', async () => {
        for (const ruta of archivosDe(crearContenido(await cargar()))) {
          expect(ruta, 'escribe solo el nombre del archivo, no una URL').not.toMatch(/^https?:/)
          expect(existsSync(resolve(FOTOS_PRIVADAS, ruta)), `falta privado/2026/fotos/${ruta}`).toBe(true)
        }
      })
    }
  })
}

revisar('plantilla pública 2026', async () => ({ ...plantilla }), false)

// Tus textos reales solo existen en tu computador (privado/ no se sube a GitHub).
if (existsSync(RUTA_PRIVADA)) {
  revisar('tus textos privados 2026', async () => ({ ...(await import(pathToFileURL(RUTA_PRIVADA).href)) }) as Constantes2026, true)
}

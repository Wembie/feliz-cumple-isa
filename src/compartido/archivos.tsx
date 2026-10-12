import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { descifrarBytes } from './cifrado'

const TIPOS: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', vtt: 'text/vtt' }

type Resolver = (src: string) => Promise<string>

const base = import.meta.env.BASE_URL
const Contexto = createContext<Resolver>(async (src) => `${base}${src.replace(/^\//, '')}`)

/**
 * Da la dirección de cada foto o video:
 * - cifrado (`….enc`): se descarga, se descifra con la llave y se muestra desde memoria;
 * - en `npm run dev`: se sirve directo desde privado/ para editar cómodo;
 * - lo demás: ruta pública normal.
 */
export function ProveedorArchivos({ llave, anio, children }: { llave: CryptoKey | null; anio: string; children: ReactNode }) {
  const { resolver, liberar } = useMemo(() => {
    const cache = new Map<string, Promise<string>>()
    const urls: string[] = []
    const resolver: Resolver = (src) => {
      let promesa = cache.get(src)
      if (!promesa) {
        if (src.endsWith('.enc')) {
          promesa = (async () => {
            if (!llave) throw new Error('Falta la llave para descifrar')
            const respuesta = await fetch(`${base}${src}`)
            if (!respuesta.ok) throw new Error(`No se pudo descargar ${src}`)
            const datos = await descifrarBytes(llave, new Uint8Array(await respuesta.arrayBuffer()))
            const extension = src.replace(/\.enc$/, '').split('.').pop() ?? ''
            const url = URL.createObjectURL(new Blob([datos], { type: TIPOS[extension] ?? 'application/octet-stream' }))
            urls.push(url)
            return url
          })()
        } else if (import.meta.env.DEV) {
          promesa = Promise.resolve(`${base}__privado/${anio}/fotos/${src}`)
        } else {
          promesa = Promise.resolve(`${base}${src.replace(/^\//, '')}`)
        }
        cache.set(src, promesa)
      }
      return promesa
    }
    return { resolver, liberar: () => urls.forEach((u) => URL.revokeObjectURL(u)) }
  }, [llave, anio])

  useEffect(() => liberar, [liberar])

  return <Contexto.Provider value={resolver}>{children}</Contexto.Provider>
}

/** Dirección lista para usar en <img>/<video>, o `null` mientras se prepara. */
export function useArchivo(src: string | null): { url: string | null; fallo: boolean } {
  const resolver = useContext(Contexto)
  const [estado, setEstado] = useState<{ src: string | null; url: string | null; fallo: boolean }>({ src: null, url: null, fallo: false })

  useEffect(() => {
    if (!src) return
    let vigente = true
    resolver(src).then(
      (url) => vigente && setEstado({ src, url, fallo: false }),
      () => vigente && setEstado({ src, url: null, fallo: true }),
    )
    return () => {
      vigente = false
    }
  }, [src, resolver])

  return estado.src === src && src ? { url: estado.url, fallo: estado.fallo } : { url: null, fallo: false }
}

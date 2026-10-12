import { useState } from 'react'
import { useArchivo } from '../../../compartido/archivos'
import type { Foto } from '../../../compartido/tipos'
import estilos from './FotoMarco.module.css'

export const PROPORCION: Record<Foto['formato'], number> = {
  vertical: 4 / 5,
  horizontal: 4 / 3,
  cuadrada: 1,
}

/** La imagen de una foto, o un marcador claramente identificado si aún no existe o no carga. */
export function FotoMarco({ foto, numero, ajuste = 'cover', etiqueta = 'Foto', alt = '', textoFallo }: { foto: { src: string | null }; numero?: number; ajuste?: 'cover' | 'contain'; etiqueta?: string; alt?: string; textoFallo: string }) {
  // Las fotos llegan cifradas: useArchivo las descifra (o, en desarrollo, las sirve desde privado/).
  const { url, fallo: falloArchivo } = useArchivo(foto.src)
  const [falloImagen, setFalloImagen] = useState(false)
  const fallo = falloArchivo || falloImagen

  if (!foto.src || fallo) {
    return (
      <span className={estilos.marcador}>
        <svg viewBox="0 0 48 40" width="44" height="36" aria-hidden="true">
          <path d="M4 12h9l4-6h14l4 6h9v24H4z" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="24" cy="23" r="8" fill="var(--menta)" stroke="var(--tinta)" strokeWidth="3" />
        </svg>
        <span className={estilos.marcadorTitulo}>
          {etiqueta}
          {numero !== undefined && ` ${numero}`}
        </span>
        <span className={estilos.marcadorTexto}>{fallo ? textoFallo : 'Pendiente · privado/2026/fotos/'}</span>
      </span>
    )
  }

  // Mientras se descifra: el marco vacío reserva el espacio.
  if (!url) return <span className={estilos.cargando} aria-hidden="true" />

  return (
    <img
      className={estilos.imagen}
      data-ajuste={ajuste}
      src={url}
      alt={alt}
      decoding="async"
      draggable={false}
      onError={() => setFalloImagen(true)}
    />
  )
}

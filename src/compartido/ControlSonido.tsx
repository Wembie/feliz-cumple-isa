import { useEffect, useState } from 'react'
import { activarSonido, aplicarPorDefecto, configurarVolumen, sonidoActivo, suscribirSonido } from './sonido'
import type { ConfigSonido } from './tipos'
import estilos from './ControlSonido.module.css'

/** Botón fijo para activar o silenciar los efectos. Recuerda la elección de Isa. */
export function ControlSonido({ config }: { config: ConfigSonido }) {
  const [activo, setActivo] = useState(() => {
    aplicarPorDefecto(config.activoPorDefecto)
    return sonidoActivo()
  })

  useEffect(() => {
    configurarVolumen(config.volumen)
    return suscribirSonido(setActivo)
  }, [config.volumen])

  if (!config.disponible) return null

  return (
    <button
      type="button"
      className={estilos.boton}
      data-activo={activo}
      aria-pressed={activo}
      aria-label="Sonido"
      onClick={() => activarSonido(!activo)}
    >
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
        <path d="M5 12h5l7-6v20l-7-6H5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        {activo ? (
          <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M21 11.5a6 6 0 0 1 0 9" />
            <path d="M24.5 8a11 11 0 0 1 0 16" />
          </g>
        ) : (
          <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M21 12l7 8M28 12l-7 8" />
          </g>
        )}
      </svg>
      <span className={estilos.texto}>{activo ? config.textos.activo : config.textos.apagado}</span>
    </button>
  )
}

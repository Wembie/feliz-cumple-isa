import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { Texto } from '../../../compartido/Texto'
import { textoPlano } from '../../../compartido/pendiente'
import { sonar } from '../../../compartido/sonido'
import type { Foto } from '../../../compartido/tipos'
import { FotoMarco, PROPORCION } from './FotoMarco'
import estilos from './VisorFoto.module.css'

interface Props {
  fotos: readonly Foto[]
  /** Índice abierto, o `null` si el visor está cerrado. */
  indice: number | null
  alCambiar: (indice: number | null) => void
  textos: { leerNota: string; verFoto: string; fotoNoCarga: string; desliza: string }
}

/** `true` mientras la nota tenga texto escondido más abajo (y aún no se haya llegado al final). */
function useHayMasAbajo(caja: RefObject<HTMLElement | null>, activo: boolean) {
  const [hayMas, setHayMas] = useState(false)
  useEffect(() => {
    const el = caja.current
    if (!el || !activo) return setHayMas(false)
    const medir = () => setHayMas(el.scrollHeight - el.clientHeight - el.scrollTop > 8)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    for (const hijo of el.children) ro.observe(hijo)
    el.addEventListener('scroll', medir, { passive: true })
    void document.fonts?.ready.then(medir)
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', medir)
    }
  }, [caja, activo])
  return hayMas
}

/** Foto en grande; se voltea para leer la nota de detrás. Usa <dialog> nativo (foco y Escape). */
export function VisorFoto({ fotos, indice, alCambiar, textos }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [volteada, setVolteada] = useState(false)
  const foto = indice === null ? null : fotos[indice]
  const reverso = useRef<HTMLDivElement>(null)
  const hayMas = useHayMasAbajo(reverso, volteada && indice !== null)

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (indice !== null && !d.open) {
      try {
        d.showModal()
      } catch {
        d.setAttribute('open', '')
      }
      document.documentElement.style.overflow = 'hidden'
    } else if (indice === null && d.open) {
      d.close()
    }
  }, [indice])

  useEffect(() => () => void (document.documentElement.style.overflow = ''), [])

  const ir = (paso: number) => {
    if (indice === null) return
    setVolteada(false)
    alCambiar((indice + paso + fotos.length) % fotos.length)
  }

  const voltear = () => {
    sonar('papel')
    setVolteada((v) => !v)
  }

  return (
    <dialog
      ref={dialogo}
      className={estilos.visor}
      aria-label={foto ? `Foto ${(indice ?? 0) + 1} de ${fotos.length}: ${textoPlano(foto.alt, 'foto pendiente')}` : 'Foto'}
      onClose={() => {
        document.documentElement.style.overflow = ''
        setVolteada(false)
        alCambiar(null)
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogo.current?.close()
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') ir(1)
        if (e.key === 'ArrowLeft') ir(-1)
      }}
    >
      {foto && indice !== null && (
        <div className={estilos.marco}>
          <button type="button" className={estilos.cerrar} onClick={() => dialogo.current?.close()} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          </button>

          <div className={estilos.escena} style={{ '--r': PROPORCION[foto.formato] } as CSSProperties}>
            <div className={estilos.tarjeta} data-volteada={volteada} key={indice}>
              <button type="button" className={`${estilos.cara} ${estilos.frente}`} onClick={voltear} aria-hidden={volteada} tabIndex={volteada ? -1 : 0} aria-label="Voltear la foto para leer la nota">
                <FotoMarco foto={foto} numero={indice + 1} ajuste="contain" textoFallo={textos.fotoNoCarga} />
                {foto.src && <span className="solo-lectores">{textoPlano(foto.alt, '')}</span>}
              </button>
              <div ref={reverso} className={`${estilos.cara} ${estilos.reverso}`} aria-hidden={!volteada}>
                <p className={estilos.reversoPie}>
                  <Texto valor={foto.pie} />
                </p>
                <p className={estilos.reversoNota}>
                  <Texto valor={foto.nota} />
                </p>
                {/* Pista para el celular: la nota sigue más abajo. Tocarla también baja. */}
                <button
                  type="button"
                  className={estilos.desliza}
                  data-visible={hayMas}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => reverso.current?.scrollBy({ top: reverso.current.clientHeight * 0.7, behavior: 'smooth' })}
                >
                  <span>
                    {textos.desliza} <b>↓</b>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className={estilos.controles}>
            {fotos.length > 1 && (
              <button type="button" className={`boton ${estilos.flecha}`} onClick={() => ir(-1)} aria-label="Foto anterior">
                ←
              </button>
            )}
            <button type="button" className={`boton ${estilos.voltear}`} onClick={voltear} aria-pressed={volteada}>
              {volteada ? textos.verFoto : textos.leerNota}
            </button>
            {fotos.length > 1 && (
              <button type="button" className={`boton ${estilos.flecha}`} onClick={() => ir(1)} aria-label="Foto siguiente">
                →
              </button>
            )}
          </div>
          <p className={estilos.contador} aria-hidden="true">
            {indice + 1} / {fotos.length}
          </p>
        </div>
      )}
    </dialog>
  )
}

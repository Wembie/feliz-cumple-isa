import { useEffect, useRef, type CSSProperties } from 'react'
import { Texto } from '../../../compartido/Texto'
import { textoPlano } from '../../../compartido/pendiente'
import type { Regalo, Texto as TipoTexto } from '../../../compartido/tipos'
import { Sorpresa, type TextosSorpresa } from './Sorpresa'
import estilos from './VisorRegalo.module.css'

interface Props {
  regalo: Regalo | null
  textoCerrar: TipoTexto
  textos: TextosSorpresa
  alCerrar: () => void
}

/** Vista ampliada de un regalo abierto. <dialog> nativo: foco atrapado, Escape y foco de vuelta al paquete. */
export function VisorRegalo({ regalo, textoCerrar, textos, alCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (regalo && !d.open) {
      try {
        d.showModal()
      } catch {
        d.setAttribute('open', '')
      }
      document.documentElement.style.overflow = 'hidden'
    } else if (!regalo && d.open) {
      d.close()
    }
  }, [regalo])

  useEffect(() => () => void (document.documentElement.style.overflow = ''), [])

  const cerrar = () => dialogo.current?.close()

  return (
    <dialog
      ref={dialogo}
      className={estilos.visor}
      aria-label={regalo ? textoPlano(regalo.titulo, 'Regalo') : 'Regalo'}
      onClose={() => {
        document.documentElement.style.overflow = ''
        alCerrar()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      {regalo && (
        <div className={estilos.marco}>
          <button type="button" className={estilos.cerrar} onClick={cerrar} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          </button>

          <article
            key={regalo.id}
            className={estilos.tarjeta}
            data-destacado={!!regalo.destacado}
            style={{ '--papel-regalo': `var(--${regalo.papel})`, '--cinta-regalo': `var(--${regalo.cinta})` } as CSSProperties}
          >
            <Sorpresa contenido={regalo.contenido} titulo={regalo.titulo} textos={textos} />
            {regalo.mensaje && (
              <p className={estilos.mensaje}>
                <Texto valor={regalo.mensaje} />
              </p>
            )}
          </article>

          <button type="button" className={`boton ${estilos.volver}`} onClick={cerrar}>
            <span aria-hidden="true">←</span> <Texto valor={textoCerrar} />
          </button>
        </div>
      )}
    </dialog>
  )
}

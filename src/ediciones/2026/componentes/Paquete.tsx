import { forwardRef, type CSSProperties } from 'react'
import { Texto } from '../../../compartido/Texto'
import { textoPlano } from '../../../compartido/pendiente'
import type { Regalo } from '../../../compartido/tipos'
import type { EstadoRegalo } from '../regalos'
import { Lazo } from './Graficos'
import estilos from './Paquete.module.css'

interface Props {
  regalo: Regalo
  indice: number
  total: number
  estado: EstadoRegalo
  /** Sacudida de "todavía no" en un regalo bloqueado. */
  negado: boolean
  /** Texto de la pegatina del sobre. */
  pegatina: string
  duracion: number
  alActivar: () => void
}

/** Un regalo ilustrado: caja con tapa, cinta y moño (o un sobre). Es un único botón. */
export const Paquete = forwardRef<HTMLButtonElement, Props>(function Paquete(
  { regalo, indice, total, estado, negado, pegatina, duracion, alActivar },
  ref,
) {
  const titulo = textoPlano(regalo.titulo, 'regalo')
  const etiqueta = textoPlano(regalo.etiqueta, 'regalo')
  const nombre = !regalo.disponible
    ? `Regalo ${indice + 1} de ${total}: ${etiqueta}. Todavía no se puede abrir`
    : estado === 'abierto'
      ? `Volver a ver: ${titulo}`
      : `Abrir regalo ${indice + 1} de ${total}: ${etiqueta}`
  const esSobre = regalo.apertura === 'sobre'

  return (
    <button
      ref={ref}
      type="button"
      className={estilos.paquete}
      data-estado={estado}
      data-apertura={regalo.destacado ? 'destacado' : regalo.apertura}
      data-forma={esSobre ? 'sobre' : regalo.forma}
      data-estampado={regalo.estampado}
      data-papel={regalo.papel}
      data-bloqueado={!regalo.disponible}
      data-negado={negado}
      style={
        {
          '--papel-regalo': `var(--${regalo.papel})`,
          '--cinta-regalo': `var(--${regalo.cinta})`,
          '--duracion': `${duracion}ms`,
        } as CSSProperties
      }
      aria-label={nombre}
      aria-haspopup="dialog"
      aria-disabled={!regalo.disponible}
      onClick={alActivar}
    >
      {regalo.destacado && <span className={estilos.rayos} aria-hidden="true" />}
      <span className={estilos.sombra} aria-hidden="true" />

      {esSobre ? (
        <span className={estilos.cuerpo} aria-hidden="true">
          <span className={estilos.sobreFondo} />
          <span className={estilos.cartita}>
            <i />
            <i />
            <i />
          </span>
          <svg className={estilos.sobreBolsillo} viewBox="0 0 100 64" preserveAspectRatio="none">
            <path d="M0 0 50 36 100 0v64H0Z" />
          </svg>
          <svg className={estilos.sobreSolapa} viewBox="0 0 100 40" preserveAspectRatio="none">
            <path d="M0 0h100L50 40Z" />
          </svg>
          <span className={estilos.pegatina}>{pegatina}</span>
        </span>
      ) : (
        <span className={estilos.cuerpo} aria-hidden="true">
          <span className={estilos.caja}>
            <span className={estilos.interior}>
              <i />
              <i />
            </span>
            {regalo.apertura === 'misterio' && !regalo.destacado && (
              <span className={estilos.muelle}>
                <svg viewBox="0 0 20 40" preserveAspectRatio="none">
                  <path d="M10 40 2 34l16-6-16-6 16-6-16-6 16-6-8-4" />
                </svg>
                <b>?</b>
              </span>
            )}
            <span className={estilos.frente}>
              <span className={estilos.cintaV} />
            </span>
            <span className={estilos.lado} />
          </span>
          <span className={estilos.tapa}>
            <span className={estilos.tapaFrente}>
              <span className={estilos.cintaV} />
            </span>
            <span className={estilos.tapaLado} />
          </span>
          <Lazo className={estilos.mono} color="var(--cinta-regalo)" />
        </span>
      )}

      <span className={estilos.etiqueta} aria-hidden="true">
        <Texto valor={regalo.etiqueta} />
      </span>

      {!regalo.disponible && (
        <span className={estilos.candado} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="5" y="10" width="14" height="11" rx="2" fill="var(--girasol)" stroke="var(--tinta)" strokeWidth="2.4" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="var(--tinta)" strokeWidth="2.4" />
          </svg>
        </span>
      )}
    </button>
  )
})

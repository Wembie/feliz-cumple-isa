import { useEffect, useRef, type CSSProperties } from 'react'
import { useCelebrar } from '../../../compartido/Confeti'
import { Ajustado } from '../../../compartido/Ajustado'
import { Texto } from '../../../compartido/Texto'
import { useEnPantalla } from '../../../compartido/hooks'
import type { PropsEdicion } from '../../registro'
import type { Contenido2026 } from '../contenido'
import estilos from './Cierre.module.css'

/** Cierre: ISA! en ola, confeti al llegar y un botón discreto para repetirlo. */
export function Cierre({ contenido, otras }: { contenido: Contenido2026; otras: PropsEdicion['otras'] }) {
  const { cierre, entrada, fecha } = contenido
  const celebrar = useCelebrar()
  const seccion = useRef<HTMLElement>(null)
  const visible = useEnPantalla(seccion, { umbral: 0.45 })
  const yaCelebrado = useRef(false)

  useEffect(() => {
    if (visible && !yaCelebrado.current) {
      yaCelebrado.current = true
      celebrar()
    }
  }, [visible, celebrar])

  return (
    <section ref={seccion} className={estilos.cierre} data-visible={visible} aria-labelledby="titulo-cierre">
      <Ajustado as="p" className={estilos.isa} partir={false}>
        {Array.from(entrada.letras).map((letra, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} aria-hidden="true">
            {letra}
          </span>
        ))}
      </Ajustado>
      <h2 id="titulo-cierre" className={estilos.frase}>
        <Texto valor={cierre.frase} />
      </h2>
      <p className={estilos.subfrase}>
        <Texto valor={cierre.subfrase} />
      </p>
      <button type="button" className={`boton ${estilos.repetir}`} onClick={celebrar}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 20 9 6l9 9-14 5Z" fill="var(--girasol)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M14 4v2M19 9h2M17.5 5.5 19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <Texto valor={cierre.boton} />
      </button>

      <footer className={estilos.pie}>
        <span>
          <Texto valor={cierre.pie} /> · {fecha.dia}.{fecha.mes}.{fecha.anio}
        </span>
        {otras.length > 0 && (
          <nav aria-label="Otras ediciones">
            {otras.map((e) => (
              <a key={e.anio} href={`#/${e.anio}`}>
                {e.titulo}
              </a>
            ))}
          </nav>
        )}
      </footer>
    </section>
  )
}

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { paginar } from '../../../compartido/carta'
import { Ajustado } from '../../../compartido/Ajustado'
import { Texto } from '../../../compartido/Texto'
import { sonar } from '../../../compartido/sonido'
import type { Contenido2026 } from '../contenido'
import { Sello } from '../componentes/Graficos'
import comun from './comun.module.css'
import estilos from './Carta.module.css'

type Estado = 'cerrada' | 'abriendo' | 'abierta'

type Paso = 'desplegar' | 'adelante' | 'atras'

/**
 * Momento 4: un sobre cerrado que, al tocarlo, se abre y deja la carta a la vista.
 * Si la carta es larga se reparte en hojas que se pasan como papel.
 */
export function Carta({ contenido }: { contenido: Contenido2026 }) {
  const { carta, fecha, nombre } = contenido
  const [estado, setEstado] = useState<Estado>('cerrada')
  const hoja = useRef<HTMLElement>(null)
  const hojas = useMemo(() => paginar(carta.parrafos, carta.caracteresPorHoja), [carta.parrafos, carta.caracteresPorHoja])
  const [actual, setActual] = useState(0)
  const [paso, setPaso] = useState<Paso>('desplegar')
  const primera = actual === 0
  const ultima = actual === hojas.length - 1

  useEffect(() => {
    if (estado !== 'abriendo') return
    const t = window.setTimeout(() => setEstado('abierta'), 1250)
    return () => window.clearTimeout(t)
  }, [estado])

  useEffect(() => {
    if (estado === 'abierta') hoja.current?.focus({ preventScroll: true })
  }, [estado])

  const irA = (destino: number) => {
    if (destino < 0 || destino >= hojas.length || destino === actual) return
    sonar('papel')
    setPaso(destino > actual ? 'adelante' : 'atras')
    setActual(destino)
    // La hoja nueva empieza arriba: si su inicio quedó fuera de la vista, se sube hasta él.
    requestAnimationFrame(() => {
      const el = hoja.current
      if (!el) return
      el.focus({ preventScroll: true })
      if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const abrir = () => {
    if (estado !== 'cerrada') return
    sonar('papel')
    setEstado('abriendo')
  }

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-carta">
      <div className={`${comun.contenedor} ${estilos.rejilla}`}>
        <div className={estilos.cabeza}>
          <span className={`${comun.numero} ${estilos.numero}`} aria-hidden="true">
            04
          </span>
          <p className={comun.antetitulo}>
            <Texto valor={carta.antetitulo} />
          </p>
          <h2 id="titulo-carta" className={estilos.titulo}>
            <span>
              <Texto valor={carta.titulo.linea1} />
            </span>{' '}
            <Ajustado solapable className={estilos.tituloDestacado}>
              <Texto valor={carta.titulo.linea2} />
            </Ajustado>
          </h2>
        </div>

        {estado !== 'abierta' ? (
          <div className={estilos.zonaSobre}>
            <button
              type="button"
              className={estilos.sobre}
              data-estado={estado}
              onClick={abrir}
              aria-expanded={estado !== 'cerrada'}
              aria-label={`Abrir la carta para ${nombre}`}
            >
              <span className={estilos.trasera} aria-hidden="true" />
              <span className={estilos.asomada} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <svg className={estilos.bolsillo} viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 0 80 60 160 0v100H0Z" />
              </svg>
              <svg className={estilos.solapa} viewBox="0 0 160 62" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 0h160L80 62Z" />
              </svg>
              <span className={estilos.lacre} aria-hidden="true">
                {nombre.slice(0, 3).toUpperCase()}
              </span>
              <span className={estilos.destinatario} aria-hidden="true">
                <small>
                  <Texto valor={carta.remite} />
                </small>
                <Texto valor={carta.para} /> {nombre}
              </span>
              <span className={estilos.estampilla} aria-hidden="true">
                <svg viewBox="0 0 40 34" width="34" height="29">
                  <path d="M6 30h28M9 30V18h22v12M12 18v-5h16v5M20 13V7" fill="none" stroke="var(--tinta)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 2c3 3 3 5 0 6-3-1-3-3 0-6Z" fill="var(--tomate)" stroke="var(--tinta)" strokeWidth="1.5" />
                </svg>
                {fecha.dia}·{fecha.mes}
              </span>
            </button>
            <p className={estilos.pista} aria-hidden="true">
              <Texto valor={carta.pista} />
            </p>
          </div>
        ) : (
          <div className={estilos.mazo} data-restantes={Math.min(hojas.length - actual - 1, 2)}>
            <article
              ref={hoja}
              key={actual}
              id="carta-texto"
              className={estilos.hoja}
              data-paso={paso}
              tabIndex={-1}
              aria-label={hojas.length > 1 ? `Carta para ${nombre}, ${carta.hojas.hoja.toLowerCase()} ${actual + 1} ${carta.hojas.de} ${hojas.length}` : `Carta para ${nombre}`}
            >
              {primera && (
                <Sello className={estilos.selloHoja} texto={`${carta.sello} • ${nombre.toUpperCase()} • ${fecha.anio} • `} centro={`${fecha.dia}/${fecha.mes}`} />
              )}
              <p className={estilos.membrete} aria-hidden="true">
                <span>
                  {contenido.entrada.letras} · {carta.membrete} · {fecha.dia}.{fecha.mes}.{fecha.anio}
                </span>
                {hojas.length > 1 && (
                  <span className={estilos.folio}>
                    {actual + 1}/{hojas.length}
                  </span>
                )}
              </p>
              {primera && (
                <p className={estilos.saludo} style={{ '--n': 0 } as CSSProperties}>
                  <Texto valor={carta.saludo} />
                </p>
              )}
              {(hojas[actual] ?? []).map((parrafo, i) => (
                <p key={i} className={estilos.parrafo} style={{ '--n': Math.min(i + 1, 8) } as CSSProperties}>
                  <Texto valor={parrafo} />
                </p>
              ))}
              {ultima && (
                <>
                  <p className={estilos.despedida} style={{ '--n': 9 } as CSSProperties}>
                    <Texto valor={carta.despedida} />
                  </p>
                  <p className={estilos.firma} style={{ '--n': 10 } as CSSProperties}>
                    <Texto valor={carta.firma} />
                  </p>
                  {carta.posdata && (
                    <p className={estilos.posdata} style={{ '--n': 10 } as CSSProperties}>
                      <Texto valor={carta.posdata} />
                    </p>
                  )}
                </>
              )}

              {hojas.length > 1 && (
                <nav className={estilos.paginacion} aria-label="Hojas de la carta">
                  <button type="button" className={`boton ${estilos.pasar}`} onClick={() => irA(actual - 1)} disabled={primera}>
                    <span aria-hidden="true">←</span> <Texto valor={carta.hojas.anterior} />
                  </button>
                  <span className={estilos.contadorHojas} aria-live="polite">
                    <Texto valor={carta.hojas.hoja} /> {actual + 1} <Texto valor={carta.hojas.de} /> {hojas.length}
                  </span>
                  <button type="button" className={`boton ${estilos.pasar} ${estilos.pasarSiguiente}`} onClick={() => irA(actual + 1)} disabled={ultima}>
                    <Texto valor={carta.hojas.siguiente} /> <span aria-hidden="true">→</span>
                  </button>
                </nav>
              )}
            </article>
          </div>
        )}
      </div>
    </section>
  )
}

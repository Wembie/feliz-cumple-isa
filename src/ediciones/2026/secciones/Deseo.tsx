import { useCallback, useEffect, useRef, useState } from 'react'
import { useCelebrar } from '../../../compartido/Confeti'
import { Ajustado, escalaCirculo } from '../../../compartido/Ajustado'
import { Texto } from '../../../compartido/Texto'
import { escucharSoplido, microfonoDisponible, type EscuchaSoplido } from '../../../compartido/microfono'
import { textoPlano } from '../../../compartido/pendiente'
import { sonar } from '../../../compartido/sonido'
import type { Contenido2026 } from '../contenido'
import { Insignia } from '../componentes/Graficos'
import { Pastel } from '../componentes/Pastel'
import { limitarVelas } from '../velas'
import comun from './comun.module.css'
import estilos from './Deseo.module.css'

type EstadoMicro = 'inactivo' | 'pidiendo' | 'escuchando' | 'error'

/** Momento 2: apagar las velas (tocando, con un botón o soplando) y celebrar. */
export function Deseo({ contenido }: { contenido: Contenido2026 }) {
  const { deseo } = contenido
  const total = limitarVelas(deseo.velas)
  const [apagadas, setApagadas] = useState<boolean[]>(() => Array(total).fill(false))
  const [exito, setExito] = useState(false)
  const [micro, setMicro] = useState<EstadoMicro>('inactivo')
  const [hayMicro] = useState(microfonoDisponible)
  const celebrar = useCelebrar()
  const temporizadores = useRef<number[]>([])
  const escucha = useRef<EscuchaSoplido | null>(null)

  const quedan = apagadas.filter((a) => !a).length

  const limpiarTemporizadores = () => {
    temporizadores.current.forEach((t) => window.clearTimeout(t))
    temporizadores.current = []
  }

  // Fuente de verdad de las velas apagadas. No se sincroniza desde el estado: un render
  // atrasado (muchas velas apagándose seguido en un celular lento) podría "reencender" alguna.
  const actuales = useRef(apagadas)

  const apagar = useCallback((i: number) => {
    if (actuales.current[i] !== false) return
    actuales.current = actuales.current.map((a, j) => a || j === i)
    sonar('soplo')
    setApagadas(actuales.current)
  }, [])

  const apagarSiguiente = useCallback(() => {
    const i = actuales.current.indexOf(false)
    if (i !== -1) apagar(i)
  }, [apagar])

  // Todas apagadas → celebración (una sola vez por encendido).
  useEffect(() => {
    if (quedan > 0 || exito) return
    escucha.current?.detener()
    escucha.current = null
    setMicro('inactivo')
    const t = window.setTimeout(() => {
      setExito(true)
      celebrar()
    }, 380)
    return () => window.clearTimeout(t)
  }, [quedan, exito, celebrar])

  useEffect(
    () => () => {
      limpiarTemporizadores()
      escucha.current?.detener()
    },
    [],
  )

  const soplarTodas = () => {
    limpiarTemporizadores()
    // Con muchas velas, más rápido: el soplido completo dura como mucho ~1,4 s.
    const intervalo = Math.max(60, Math.min(140, 1400 / total))
    apagadas.forEach((a, i) => {
      if (!a) temporizadores.current.push(window.setTimeout(() => apagar(i), intervalo * temporizadores.current.length))
    })
  }

  const usarMicrofono = async () => {
    if (micro === 'escuchando') {
      escucha.current?.detener()
      escucha.current = null
      setMicro('inactivo')
      return
    }
    setMicro('pidiendo')
    try {
      escucha.current = await escucharSoplido(apagarSiguiente)
      setMicro('escuchando')
    } catch {
      setMicro('error')
    }
  }

  const reencender = () => {
    limpiarTemporizadores()
    setExito(false)
    actuales.current = Array(total).fill(false)
    setApagadas(actuales.current)
  }

  const estado = exito
    ? `${textoPlano(deseo.exito.sticker)} ${textoPlano(deseo.exito.texto)}`
    : (quedan === total ? deseo.contador.todas : quedan === 1 ? deseo.contador.queda : deseo.contador.quedan).replace('{n}', String(quedan))

  return (
    <section id="deseo" className={estilos.deseo} aria-labelledby="titulo-deseo">
      <div className={`${comun.contenedor} ${estilos.rejilla}`}>
        <div className={estilos.cabeza}>
          <span className={`${comun.numero} ${estilos.numero}`} aria-hidden="true">
            02
          </span>
          <p className={comun.antetitulo}>
            <Texto valor={deseo.antetitulo} />
          </p>
          <h2 id="titulo-deseo" className={estilos.titulo}>
            <span>
              <Texto valor={deseo.titulo.linea1} />
            </span>{' '}
            <Ajustado solapable className={estilos.tituloGrande}>
              <Texto valor={deseo.titulo.linea2} />
            </Ajustado>
          </h2>
          <p className={estilos.instrucciones}>
            <Texto valor={deseo.instrucciones} />
          </p>
        </div>

        <div className={estilos.escena}>
          <Pastel apagadas={apagadas} texto={textoPlano(deseo.textoPastel, '')} alApagar={apagar} />
          {exito && (
            <Insignia className={estilos.insigniaExito} color="var(--girasol)" escala={escalaCirculo(deseo.exito.sticker, 20, 9)}>
              <Texto valor={deseo.exito.sticker} />
            </Insignia>
          )}
        </div>

        <div className={estilos.controles}>
          <p className={estilos.estado} aria-live="polite">
            {exito ? (
              <>
                <strong>
                  <Texto valor={deseo.exito.sticker} />
                </strong>{' '}
                <Texto valor={deseo.exito.texto} />
              </>
            ) : (
              <>
                <span className={estilos.contador} aria-hidden="true">
                  {apagadas.map((a, i) => (
                    <i key={i} data-apagada={a} />
                  ))}
                </span>
                <span>{estado}</span>
              </>
            )}
          </p>

          <div className={estilos.botones}>
            {exito ? (
              <button type="button" className="boton" onClick={reencender}>
                <Texto valor={deseo.reencender} />
              </button>
            ) : (
              <>
                <button type="button" className={`boton ${estilos.botonPrincipal}`} onClick={soplarTodas}>
                  <Texto valor={deseo.botonSoplarTodas} />
                </button>
                {hayMicro && (
                  <button type="button" className="boton" onClick={usarMicrofono} aria-pressed={micro === 'escuchando'} disabled={micro === 'pidiendo'}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <rect x="8" y="2" width="8" height="13" rx="4" fill="currentColor" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <Texto valor={deseo.botonMicrofono} />
                  </button>
                )}
              </>
            )}
          </div>
          {micro === 'escuchando' && (
            <p className={estilos.aviso}>
              <Texto valor={deseo.estadoEscuchando} />
            </p>
          )}
          {micro === 'error' && (
            <p className={estilos.aviso} role="alert">
              <Texto valor={deseo.errorMicrofono} />
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

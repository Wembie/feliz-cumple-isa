import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useRafaga } from '../../../compartido/Confeti'
import { Ajustado } from '../../../compartido/Ajustado'
import { Texto } from '../../../compartido/Texto'
import { sonar } from '../../../compartido/sonido'
import type { Regalo } from '../../../compartido/tipos'
import type { Contenido2026 } from '../contenido'
import { Paquete } from '../componentes/Paquete'
import { VisorRegalo } from '../componentes/VisorRegalo'
import { coreografiaDe, ordenEscritorio, type EstadoRegalo } from '../regalos'
import comun from './comun.module.css'
import estilos from './Regalos.module.css'

// Colocación "a mano": giros y alturas deterministas.
const GIROS = [-4, 3, -2, 0, 4, -3, 2, -1]
const ALTURAS = [0, 22, -8, 0, 26, 6, -12, 14]

/** Momento 5: una colección de paquetes que se abren cada uno a su manera. */
export function Regalos({ contenido }: { contenido: Contenido2026 }) {
  const { regalos, nombre, mundo } = contenido
  const lista = regalos.lista
  const [estados, setEstados] = useState<Record<string, EstadoRegalo>>({})
  const [vista, setVista] = useState<string | null>(null)
  const [negado, setNegado] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const abriendo = useRef<string | null>(null)
  const temporizadores = useRef<number[]>([])
  const botones = useRef(new Map<string, HTMLButtonElement>())
  const coleccion = useRef<HTMLUListElement>(null)
  const rafaga = useRafaga()
  const orden = useMemo(() => ordenEscritorio(lista), [lista])
  const abiertos = lista.filter((r) => estados[r.id] === 'abierto').length
  // En móvil (2 columnas), el último paquete normal se centra si queda solo en su fila.
  const normales = lista.filter((r) => !r.destacado)
  const solo = normales.length % 2 === 1 ? normales[normales.length - 1]?.id : undefined

  const limpiar = () => {
    temporizadores.current.forEach((t) => window.clearTimeout(t))
    temporizadores.current = []
  }
  const programar = (fn: () => void, ms: number) => temporizadores.current.push(window.setTimeout(fn, ms))

  useEffect(() => limpiar, [])

  // Los paquetes "aterrizan" sobre la mesa al entrar en pantalla.
  useEffect(() => {
    const raiz = coleccion.current
    if (!raiz) return
    const puestos = Array.from(raiz.querySelectorAll<HTMLElement>('[data-aparece]'))
    if (typeof IntersectionObserver === 'undefined') return
    raiz.dataset.listo = 'true'
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (!e.isIntersecting) return
          ;(e.target as HTMLElement).dataset.visible = 'true'
          obs.unobserve(e.target)
        }),
      { threshold: 0.2 },
    )
    puestos.forEach((p) => obs.observe(p))
    return () => obs.disconnect()
  }, [])

  const terminar = (id: string) => {
    abriendo.current = null
    setEstados((prev) => ({ ...prev, [id]: 'abierto' }))
    setVista(id)
  }

  const activar = (regalo: Regalo) => {
    const { id } = regalo
    if (!regalo.disponible) {
      setNegado(id)
      setAviso('')
      window.setTimeout(() => setAviso(regalos.bloqueado), 30)
      window.setTimeout(() => setNegado((n) => (n === id ? null : n)), 520)
      return
    }
    if (estados[id] === 'abierto') {
      setVista(id)
      return
    }
    // Un solo paquete abriéndose a la vez; tocar otra vez el mismo salta al contenido.
    if (abriendo.current) {
      if (abriendo.current === id) {
        limpiar()
        terminar(id)
      }
      return
    }

    const c = coreografiaDe(regalo)
    abriendo.current = id
    setEstados((prev) => ({ ...prev, [id]: 'abriendo' }))
    c.sonidos.forEach(([momento, efecto]) => programar(() => sonar(efecto), momento * c.duracion))
    programar(() => {
      const caja = botones.current.get(id)?.getBoundingClientRect()
      if (caja) rafaga(caja.left + caja.width * 0.42, caja.top + caja.height * 0.3, c.rafaga)
    }, c.rafaga.momento * c.duracion)
    programar(() => terminar(id), c.duracion + 60)
  }

  const regaloVisible = lista.find((r) => r.id === vista) ?? null

  return (
    <section className={estilos.regalos} aria-labelledby="titulo-regalos">
      <div className={comun.contenedor}>
        <div className={estilos.cabeza}>
          <div className={estilos.cabezaTitulo}>
            <span className={`${comun.numero} ${estilos.numero}`} aria-hidden="true">
              05
            </span>
            <p className={comun.antetitulo}>
              <Texto valor={regalos.antetitulo} />
            </p>
            <h2 id="titulo-regalos" className={estilos.titulo}>
              <span className={estilos.tituloLinea}>
                <Texto valor={regalos.titulo.linea1} />
              </span>{' '}
              <Ajustado solapable className={estilos.tituloGrande}>
                <Texto valor={regalos.titulo.grande} />
              </Ajustado>{' '}
              <Ajustado className={estilos.tituloEtiqueta}>
                <Texto valor={regalos.titulo.etiqueta} />
              </Ajustado>
            </h2>
          </div>
          <div className={estilos.intro}>
            <p className={estilos.subtitulo}>
              <Texto valor={regalos.subtitulo} />
            </p>
            <p className={estilos.pista}>
              <Texto valor={regalos.pista} />
            </p>
            <p className={estilos.contador} aria-live="polite">
              <span className={estilos.contadorPuntos} aria-hidden="true">
                {lista.map((r) => (
                  <i key={r.id} data-abierto={estados[r.id] === 'abierto'} />
                ))}
              </span>
              {abiertos} <Texto valor={regalos.contador.de} /> {lista.length} <Texto valor={regalos.contador.abiertos} />
            </p>
          </div>
        </div>

        <ul ref={coleccion} className={estilos.coleccion}>
          {lista.map((regalo, i) => {
            const estado = estados[regalo.id] ?? 'cerrado'
            return (
              <li
                key={regalo.id}
                className={estilos.puesto}
                data-destacado={!!regalo.destacado}
                data-solo={regalo.id === solo}
                data-aparece
                style={{ order: orden[i], '--giro': `${GIROS[i % GIROS.length]}deg`, '--y': `${ALTURAS[i % ALTURAS.length]}px`, '--i': i } as CSSProperties}
              >
                <Paquete
                  ref={(n) => {
                    if (n) botones.current.set(regalo.id, n)
                    else botones.current.delete(regalo.id)
                  }}
                  regalo={regalo}
                  indice={i}
                  total={lista.length}
                  estado={estado}
                  negado={negado === regalo.id}
                  pegatina={nombre.toUpperCase()}
                  duracion={coreografiaDe(regalo).duracion}
                  alActivar={() => activar(regalo)}
                />
                <p className={estilos.rotulo} data-visible={estado === 'abierto'} aria-hidden="true">
                  <span>✓</span> <Texto valor={regalo.titulo} />
                </p>
                {regalo.destacado && estado === 'abierto' && (
                  <button type="button" className={`boton ${estilos.volverAVer}`} onClick={() => setVista(regalo.id)}>
                    <Texto valor={regalos.volverAVer} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        <p className="solo-lectores" aria-live="assertive">
          {aviso}
        </p>
      </div>

      <VisorRegalo
        regalo={regaloVisible}
        textoCerrar={regalos.cerrar}
        textos={{ verEnGrande: regalos.verEnGrande, verPequena: regalos.verPequena, videoNoCarga: regalos.videoNoCarga, fotoNoCarga: mundo.fotoNoCarga }}
        alCerrar={() => setVista(null)}
      />
    </section>
  )
}

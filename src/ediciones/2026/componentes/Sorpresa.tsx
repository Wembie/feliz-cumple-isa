import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useArchivo } from '../../../compartido/archivos'
import { Texto } from '../../../compartido/Texto'
import { esPendiente, textoPlano } from '../../../compartido/pendiente'
import { sonar } from '../../../compartido/sonido'
import type { ContenidoRegalo, ImagenRegalo, Regalo, Texto as TipoTexto } from '../../../compartido/tipos'
import { coreografiaDe, type EstadoRegalo } from '../regalos'
import { FotoMarco, PROPORCION } from './FotoMarco'
import { Paquete } from './Paquete'
import estilos from './Sorpresa.module.css'

/** Texto que aparece palabra a palabra (los marcadores pendientes se muestran enteros). */
function PorPalabras({ valor }: { valor: TipoTexto }) {
  if (esPendiente(valor)) return <Texto valor={valor} />
  return (
    <>
      {valor.split(/(\s+)/).map((trozo, i) =>
        /^\s+$/.test(trozo) ? (
          trozo
        ) : (
          <span key={i} className={estilos.palabra} style={{ '--n': Math.min(i / 2, 24) } as CSSProperties}>
            {trozo}
          </span>
        ),
      )}
    </>
  )
}

export interface TextosSorpresa {
  verEnGrande: string
  verPequena: string
  videoNoCarga: string
  fotoNoCarga: string
}

function Imagen({ imagen, etiqueta, textos, ampliable = false }: { imagen: ImagenRegalo; etiqueta: string; textos: TextosSorpresa; ampliable?: boolean }) {
  const [ampliada, setAmpliada] = useState(false)
  const marco = (
    <span className={estilos.imagen} style={{ '--r': PROPORCION[imagen.formato] } as CSSProperties} data-ampliada={ampliada}>
      <FotoMarco foto={imagen} etiqueta={etiqueta} ajuste={ampliada ? 'contain' : 'cover'} alt={textoPlano(imagen.alt, '')} textoFallo={textos.fotoNoCarga} />
    </span>
  )
  if (!ampliable || !imagen.src) return marco
  return (
    <>
      {marco}
      <button type="button" className={`boton ${estilos.ampliar}`} aria-pressed={ampliada} onClick={() => setAmpliada(!ampliada)}>
        {ampliada ? textos.verPequena : textos.verEnGrande}
      </button>
    </>
  )
}

/** Video (con portada y subtítulos opcionales); los archivos llegan cifrados. Nunca se reproduce solo. */
function VideoRegalo({ src, portada, subtitulos, descripcion, alFallar }: { src: string; portada: string | null; subtitulos: string | null; descripcion: string; alFallar: () => void }) {
  const video = useArchivo(src)
  const imagen = useArchivo(portada)
  const pista = useArchivo(subtitulos)
  useEffect(() => {
    if (video.fallo) alFallar()
  }, [video.fallo, alFallar])
  if (!video.url) return <div className={estilos.videoCargando} aria-hidden="true" />
  return (
    <video className={estilos.reproductor} controls playsInline preload="metadata" poster={imagen.url ?? undefined} aria-label={descripcion} onError={alFallar}>
      <source src={video.url} />
      {pista.url && <track kind="captions" srcLang="es" label="Español" default src={pista.url} />}
    </video>
  )
}

/**
 * Lo que ya se abrió dentro de cada caja. Vive fuera del visor para que, al cerrarlo y volver
 * a entrar, todo siga como estaba; al recargar la página empieza de cero.
 */
const memoriaDentro = new Map<string, { estados: Record<string, EstadoRegalo>; visto: string | null }>()

/**
 * Regalos dentro de un regalo: paquetitos que se abren uno a uno (con su apertura propia)
 * y muestran su sorpresa debajo. Se pueden volver a ver en el orden que se quiera.
 */
function RegalosDentro({ titulo, regalos, textos }: { titulo: TipoTexto; regalos: Regalo[]; textos: TextosSorpresa }) {
  const clave = regalos.map((r) => r.id).join('|')
  const [estados, setEstados] = useState<Record<string, EstadoRegalo>>(() => memoriaDentro.get(clave)?.estados ?? {})
  const [visto, setVisto] = useState<string | null>(() => memoriaDentro.get(clave)?.visto ?? null)
  // Las chispas solo salen al abrir, no al volver a entrar.
  const [recien, setRecien] = useState<Record<string, true>>({})
  const abriendo = useRef<string | null>(null)
  const temporizadores = useRef<number[]>([])
  const abierto = useRef<HTMLDivElement>(null)

  useEffect(() => {
    memoriaDentro.set(clave, { estados, visto })
  }, [clave, estados, visto])

  // Si se cierra el visor a mitad de una apertura, ese regalo queda abierto.
  useEffect(
    () => () => {
      temporizadores.current.forEach((t) => window.clearTimeout(t))
      const id = abriendo.current
      const guardado = memoriaDentro.get(clave)
      if (id && guardado) memoriaDentro.set(clave, { estados: { ...guardado.estados, [id]: 'abierto' }, visto: id })
    },
    [clave],
  )

  const mostrar = (id: string) => {
    setVisto(id)
    requestAnimationFrame(() => abierto.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }
  const terminar = (id: string) => {
    abriendo.current = null
    setEstados((prev) => ({ ...prev, [id]: 'abierto' }))
    setRecien((prev) => ({ ...prev, [id]: true }))
    mostrar(id)
  }
  const activar = (regalo: Regalo) => {
    if (!regalo.disponible) return
    if (estados[regalo.id] === 'abierto') return mostrar(regalo.id)
    if (abriendo.current) {
      if (abriendo.current === regalo.id) {
        temporizadores.current.forEach((t) => window.clearTimeout(t))
        terminar(regalo.id)
      }
      return
    }
    const c = coreografiaDe({ apertura: regalo.apertura })
    abriendo.current = regalo.id
    setEstados((prev) => ({ ...prev, [regalo.id]: 'abriendo' }))
    c.sonidos.forEach(([momento, efecto]) => temporizadores.current.push(window.setTimeout(() => sonar(efecto), momento * c.duracion)))
    temporizadores.current.push(window.setTimeout(() => terminar(regalo.id), c.duracion + 60))
  }

  const visible = regalos.find((r) => r.id === visto)

  return (
    <section className={estilos.dentro} aria-label={textoPlano(titulo, 'Regalos de dentro')}>
      <p className={estilos.dentroTitulo}>
        <PorPalabras valor={titulo} />
      </p>
      <ul className={estilos.dentroPaquetes}>
        {regalos.map((regalo, i) => {
          const estado = estados[regalo.id] ?? 'cerrado'
          return (
            <li key={regalo.id} className={estilos.dentroPuesto} style={{ '--giro': `${i % 2 ? 4 : -4}deg` } as CSSProperties}>
              <Paquete
                regalo={{ ...regalo, destacado: false }}
                indice={i}
                total={regalos.length}
                estado={estado}
                negado={false}
                pegatina={textoPlano(regalo.etiqueta, '').slice(0, 4).toUpperCase()}
                duracion={coreografiaDe({ apertura: regalo.apertura }).duracion}
                alActivar={() => activar(regalo)}
              />
              {estado === 'abierto' && recien[regalo.id] && (
                <span className={estilos.chispas} aria-hidden="true">
                  {Array.from({ length: 12 }, (_, k) => (
                    <i key={k} style={{ '--k': k } as CSSProperties} />
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {visible && (
        <div ref={abierto} key={visible.id} className={estilos.dentroAbierto}>
          <Sorpresa contenido={visible.contenido} titulo={visible.titulo} textos={textos} anidado />
          {visible.mensaje && (
            <p className={estilos.dentroMensaje}>
              <Texto valor={visible.mensaje} />
            </p>
          )}
        </div>
      )}
    </section>
  )
}

/** Lo que aparece al abrir un regalo, según su tipo de contenido. */
export function Sorpresa({
  contenido,
  titulo,
  textos,
  anidado = false,
}: {
  contenido: ContenidoRegalo
  titulo: TipoTexto
  textos: TextosSorpresa
  /** Un regalo de dentro de otro: no admite otra caja dentro. */
  anidado?: boolean
}) {
  const [extraAbierto, setExtraAbierto] = useState(false)
  const [falloVideo, setFalloVideo] = useState(false)
  const alFallarVideo = useCallback(() => setFalloVideo(true), [])

  switch (contenido.tipo) {
    case 'mensaje':
      return (
        <div className={estilos.mensaje} data-tipo="mensaje">
          <h2 className={estilos.titulo}>
            <Texto valor={titulo} />
          </h2>
          <p className={estilos.mensajeTexto}>
            <PorPalabras valor={contenido.texto} />
          </p>
        </div>
      )

    case 'foto':
      return (
        <div className={estilos.foto} data-tipo="foto">
          <h2 className={estilos.titulo}>
            <Texto valor={titulo} />
          </h2>
          <figure className={estilos.polaroid}>
            <Imagen imagen={contenido.imagen} etiqueta="Foto" textos={textos} ampliable />
            <figcaption>
              <Texto valor={contenido.pie} />
            </figcaption>
          </figure>
        </div>
      )

    case 'carta':
      return (
        <div className={estilos.carta} data-tipo="carta">
          <h2 className="solo-lectores">
            <Texto valor={titulo} />
          </h2>
          <div className={estilos.hoja}>
            <p className={estilos.cartaSaludo}>
              <Texto valor={contenido.saludo} />
            </p>
            {contenido.parrafos.map((p, i) => (
              <p key={i} className={estilos.cartaParrafo}>
                <Texto valor={p} />
              </p>
            ))}
            <p className={estilos.cartaFirma}>
              <Texto valor={contenido.firma} />
            </p>
          </div>
        </div>
      )

    case 'video':
      return (
        <div className={estilos.video} data-tipo="video">
          <h2 className={estilos.titulo}>
            <Texto valor={titulo} />
          </h2>
          {contenido.src && !falloVideo ? (
            <VideoRegalo
              src={contenido.src}
              portada={contenido.portada}
              subtitulos={contenido.subtitulos}
              descripcion={textoPlano(contenido.descripcion, 'video')}
              alFallar={alFallarVideo}
            />
          ) : (
            <div className={estilos.videoPendiente}>
              <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
                <rect x="3" y="9" width="42" height="30" rx="5" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="3" />
                <path d="M20 17v14l12-7Z" fill="var(--tomate)" stroke="var(--tinta)" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
              <strong>{falloVideo ? textos.videoNoCarga : 'Video pendiente'}</strong>
              <span>privado/2026/fotos/</span>
            </div>
          )}
          <p className={estilos.pie}>
            <Texto valor={contenido.descripcion} />
          </p>
        </div>
      )

    case 'fisico':
      return (
        <div className={estilos.fisico} data-tipo="fisico">
          <div className={estilos.fisicoEscena}>
            <span className={estilos.fisicoRayos} aria-hidden="true" />
            {contenido.imagen ? (
              <Imagen imagen={contenido.imagen} etiqueta="Foto del regalo" textos={textos} ampliable />
            ) : (
              <span className={estilos.fisicoSinFoto} aria-hidden="true">
                ?
              </span>
            )}
          </div>
          <p className={estilos.fisicoAntetitulo}>
            <Texto valor={titulo} />
          </p>
          <h2 className={estilos.fisicoNombre}>
            <PorPalabras valor={contenido.nombre} />
          </h2>
          <p className={estilos.fisicoDescripcion}>
            <Texto valor={contenido.descripcion} />
          </p>
          {contenido.extra && (
            <div className={estilos.extra}>
              <button
                type="button"
                className={`boton ${estilos.extraBoton}`}
                aria-expanded={extraAbierto}
                onClick={() => {
                  sonar('sticker')
                  setExtraAbierto(!extraAbierto)
                }}
              >
                <Texto valor={contenido.extra.boton} />
              </button>
              {extraAbierto && (
                <p className={estilos.extraMensaje}>
                  <Texto valor={contenido.extra.mensaje} />
                </p>
              )}
            </div>
          )}
        </div>
      )

    case 'caja':
      // Una caja dentro de otra caja no se admite (evita bucles).
      if (anidado) return null
      return (
        <div className={estilos.caja} data-tipo="caja">
          <span className={estilos.cajaRayos} aria-hidden="true" />
          <p className={estilos.fisicoAntetitulo}>
            <Texto valor={titulo} />
          </p>
          <RegalosDentro titulo={contenido.titulo} regalos={contenido.regalos} textos={textos} />
        </div>
      )

    case 'personalizada':
      return (
        <div className={estilos.personalizada} data-tipo="personalizada">
          <h2 className={estilos.titulo}>
            <Texto valor={contenido.titulo} />
          </h2>
          {contenido.imagen && <Imagen imagen={contenido.imagen} etiqueta="Imagen" textos={textos} ampliable />}
          <p className={estilos.personalizadaTexto}>
            <Texto valor={contenido.texto} />
          </p>
          <p className={estilos.personalizadaFinal}>
            <PorPalabras valor={contenido.final} />
          </p>
        </div>
      )
  }
}

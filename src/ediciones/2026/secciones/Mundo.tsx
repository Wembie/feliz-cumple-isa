import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Ajustado } from '../../../compartido/Ajustado'
import { Texto } from '../../../compartido/Texto'
import { textoPlano } from '../../../compartido/pendiente'
import { componerCollage } from '../collage'
import type { Contenido2026 } from '../contenido'
import { FotoMarco, PROPORCION } from '../componentes/FotoMarco'
import { Cinta } from '../componentes/Graficos'
import { StickerSecreto } from '../componentes/StickerSecreto'
import { VisorFoto } from '../componentes/VisorFoto'
import comun from './comun.module.css'
import estilos from './Mundo.module.css'

// Rotaciones "colocadas a mano": deterministas para que el collage sea siempre el mismo.
const GIROS = [-3, 2.5, -4, 1.5, -2, 3]

/** Momento 3: collage editorial de fotos, notas y stickers secretos. */
export function Mundo({ contenido }: { contenido: Contenido2026 }) {
  const { mundo } = contenido
  const [abierta, setAbierta] = useState<number | null>(null)
  const seccion = useRef<HTMLElement>(null)
  const { piezas, stickersSueltos } = componerCollage(mundo.fotos, mundo.notas, mundo.stickers)

  // Aparición al entrar en pantalla + parallax leve, sin re-renderizar React.
  useEffect(() => {
    const raiz = seccion.current
    if (!raiz) return
    const items = Array.from(raiz.querySelectorAll<HTMLElement>('[data-aparece]'))
    raiz.dataset.listo = 'true'
    if (typeof IntersectionObserver === 'undefined') {
      items.forEach((el) => (el.dataset.visible = 'true'))
      return
    }
    const aparicion = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).dataset.visible = 'true'
            aparicion.unobserve(e.target)
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((el) => aparicion.observe(el))

    let frame = 0
    let enVista = false
    const actualizar = () => {
      frame = 0
      const caja = raiz.getBoundingClientRect()
      const centro = caja.top + caja.height / 2 - window.innerHeight / 2
      raiz.style.setProperty('--desplazamiento', `${(centro * -0.05).toFixed(1)}px`)
    }
    const alDesplazar = () => {
      if (enVista && !frame) frame = requestAnimationFrame(actualizar)
    }
    const vigia = new IntersectionObserver(([e]) => {
      enVista = !!e?.isIntersecting
    })
    vigia.observe(raiz)
    window.addEventListener('scroll', alDesplazar, { passive: true })

    return () => {
      aparicion.disconnect()
      vigia.disconnect()
      window.removeEventListener('scroll', alDesplazar)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={seccion} className={estilos.mundo} aria-labelledby="titulo-mundo">
      <div className={comun.contenedor}>
        <div className={estilos.cabeza}>
          <div className={estilos.cabezaTitulo}>
            <span className={`${comun.numero} ${estilos.numero}`} aria-hidden="true">
              03
            </span>
            <p className={comun.antetitulo}>
              <Texto valor={mundo.antetitulo} />
            </p>
            <h2 id="titulo-mundo" className={estilos.titulo}>
              <span className={estilos.tituloPequeno}>
                <Texto valor={mundo.titulo.pequeno} />
              </span>{' '}
              <Ajustado solapable className={estilos.tituloGrande}>
                <Texto valor={mundo.titulo.grande} />
              </Ajustado>{' '}
              <Ajustado className={estilos.tituloEtiqueta}>
                <Texto valor={mundo.titulo.etiqueta} />
              </Ajustado>
            </h2>
          </div>
          <div className={estilos.intro}>
            <p>
              <Texto valor={mundo.intro} />
            </p>
            {mundo.fotos.length > 0 && (
              <p className={estilos.pista}>
                <Texto valor={mundo.pistaFotos} />
              </p>
            )}
          </div>
        </div>

        <ul className={estilos.collage} data-cantidad={piezas.length}>
          {piezas.map((pieza, posicion) => {
            const giro = GIROS[posicion % GIROS.length]!
            if (pieza.tipo === 'nota') {
              return (
                <li key={`n${pieza.indice}`} className={estilos.pieza} data-tipo="nota" data-ranura={posicion % 6} data-aparece style={{ '--giro': `${giro}deg` } as CSSProperties}>
                  <p className={estilos.nota}>
                    <Cinta className={estilos.notaCinta} />
                    <Texto valor={pieza.texto} />
                  </p>
                </li>
              )
            }
            const { foto, indice, sticker } = pieza
            return (
              <li
                key={`f${indice}`}
                className={estilos.pieza}
                data-tipo="foto"
                data-ranura={posicion % 6}
                data-aparece
                style={{ '--giro': `${giro}deg`, '--r': PROPORCION[foto.formato] } as CSSProperties}
              >
                <figure className={estilos.figura}>
                  <button
                    type="button"
                    className={estilos.foto}
                    onClick={() => setAbierta(indice)}
                    aria-haspopup="dialog"
                    aria-label={`Abrir foto ${indice + 1}: ${textoPlano(foto.alt, 'foto pendiente')}`}
                  >
                    <span className={estilos.marco}>
                      <FotoMarco foto={foto} numero={indice + 1} textoFallo={mundo.fotoNoCarga} />
                    </span>
                  </button>
                  <Cinta className={estilos.fotoCinta} style={{ rotate: `${indice % 2 ? 6 : -5}deg` }} />
                  <figcaption className={estilos.pie}>
                    <Texto valor={foto.pie} />
                  </figcaption>
                </figure>
                {sticker && <StickerSecreto sticker={sticker} tocame={mundo.stickerTocame} className={estilos.stickerFoto} style={{ '--giro': `${indice % 2 ? 8 : -7}deg` } as CSSProperties} />}
              </li>
            )
          })}
        </ul>

        {stickersSueltos.length > 0 && (
          <div className={estilos.tira}>
            {stickersSueltos.map((s, i) => (
              <StickerSecreto key={i} sticker={s} tocame={mundo.stickerTocame} style={{ '--giro': `${GIROS[i % GIROS.length]}deg` } as CSSProperties} />
            ))}
          </div>
        )}
      </div>

      <VisorFoto fotos={mundo.fotos} indice={abierta} alCambiar={setAbierta} textos={{ leerNota: mundo.botonLeerNota, verFoto: mundo.botonVerFoto, desliza: mundo.notaDesliza, fotoNoCarga: mundo.fotoNoCarga }} />
    </section>
  )
}

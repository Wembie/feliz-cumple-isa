import type { CSSProperties } from 'react'
import { escalaCirculo } from '../../../compartido/Ajustado'
import { Texto } from '../../../compartido/Texto'
import type { Contenido2026 } from '../contenido'
import { Cinta, Flecha, Insignia, Sello } from '../componentes/Graficos'
import { LetrasVivas } from '../componentes/LetrasVivas'
import estilos from './Entrada.module.css'

/** Momento 1: un póster editorial vivo. El saludo se lee desde el primer frame. */
export function Entrada({ contenido }: { contenido: Contenido2026 }) {
  const { entrada, fecha, nombre } = contenido
  const repeticiones = Array.from({ length: 10 }, (_, i) => i)

  const irAlPastel = () => {
    document.getElementById('deseo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={estilos.entrada}>
      <div className={estilos.cabecera}>
        <span className={estilos.marca}>{entrada.letras}</span>
        <span className={estilos.cabeceraTexto}>
          <Texto valor={entrada.cabecera} />
        </span>
        <span className={estilos.fecha}>
          {fecha.dia}.{fecha.mes}.{fecha.anio}
        </span>
      </div>

      <div className={estilos.poster}>
        <h1 className={estilos.saludo}>
          <Cinta className={estilos.cintaSaludo} />
          <Texto valor={entrada.saludo} />
          <span className="solo-lectores"> {nombre}!</span>
        </h1>

        <div className={estilos.zonaLetras}>
          <LetrasVivas letras={entrada.letras} etiqueta={`Letras de ${entrada.letras}: tócalas o arrástralas`} />
          <p className={estilos.pista} aria-hidden="true">
            <Flecha className={estilos.flecha} />
            <Texto valor={entrada.pista} />
          </p>
        </div>

        <Sello className={estilos.sello} texto={entrada.sello} centro={`${fecha.dia}/${fecha.mes}`} />
        <Insignia className={estilos.insignia} escala={escalaCirculo(entrada.sticker, 20, 9)}>
          <Texto valor={entrada.sticker} />
        </Insignia>
      </div>

      <div className={estilos.cinta} aria-hidden="true" data-marquesina>
        <div className={estilos.marquesina}>
          {repeticiones.map((i) => (
            <span key={i}>
              {entrada.cinta}
              <i />
            </span>
          ))}
        </div>
      </div>

      <div className={estilos.pie}>
        <p className={estilos.eslogan}>
          <Texto valor={entrada.eslogan.antes} />{' '}
          <span className={estilos.destacado}>
            <Texto valor={entrada.eslogan.destacado} />
          </span>
        </p>
        <button
          type="button"
          className={estilos.invitacion}
          style={{ '--escala': escalaCirculo(entrada.invitacion, 16, 9) } as CSSProperties}
          onClick={irAlPastel}
        >
          <span>
            <Texto valor={entrada.invitacion} />
          </span>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M12 4v15m-6-6 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}

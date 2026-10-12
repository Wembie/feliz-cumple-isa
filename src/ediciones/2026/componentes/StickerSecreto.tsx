import { useState, type CSSProperties } from 'react'
import { Texto } from '../../../compartido/Texto'
import { sonar } from '../../../compartido/sonido'
import type { StickerSecreto as TipoSticker } from '../../../compartido/tipos'
import estilos from './StickerSecreto.module.css'

/** Sticker que se despega al tocarlo y deja ver lo que había debajo. */
export function StickerSecreto({ sticker, tocame, className, style }: { sticker: TipoSticker; tocame: string; className?: string | undefined; style?: CSSProperties }) {
  const [revelado, setRevelado] = useState(false)

  return (
    <button
      type="button"
      className={`${estilos.sticker} ${className ?? ''}`}
      style={{ '--fondo': `var(--${sticker.color})`, ...style } as CSSProperties}
      data-revelado={revelado}
      data-solapable
      aria-expanded={revelado}
      onClick={() => {
        sonar('sticker')
        setRevelado(!revelado)
      }}
    >
      <span className={estilos.debajo}>
        {revelado ? <Texto valor={sticker.secreto} /> : <span aria-hidden="true">?</span>}
      </span>
      <span className={estilos.frente} aria-hidden={revelado}>
        <Texto valor={sticker.frente} />
        <small aria-hidden="true">{tocame}</small>
      </span>
    </button>
  )
}

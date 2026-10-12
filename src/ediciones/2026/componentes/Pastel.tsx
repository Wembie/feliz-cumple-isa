import type { CSSProperties } from 'react'
import { colocarVelas, ELEVACION_FILA, filasDeVelas } from '../velas'
import estilos from './Pastel.module.css'

const ANCHO = 400
const ALTO = 430
const SUPERFICIE = 212 // y de la parte de arriba del piso superior
const VELA_ALTO = 150
const VELA_ANCHO = 52

/** Gotas de glaseado: se dibuja la unión dos veces (contorno de tinta + relleno) para un trazo limpio. */
function Glaseado({ x, y, ancho, gotas, color }: { x: number; y: number; ancho: number; gotas: number[]; color: string }) {
  const paso = ancho / gotas.length
  const formas = (
    <>
      <rect x={x} y={y} width={ancho} height={22} rx={11} />
      {gotas.map((largo, i) => (
        <rect key={i} x={x + i * paso + paso * 0.18} y={y + 6} width={paso * 0.64} height={largo} rx={paso * 0.32} />
      ))}
    </>
  )
  return (
    <g>
      <g fill="var(--tinta)" stroke="var(--tinta)" strokeWidth="7" strokeLinejoin="round">
        {formas}
      </g>
      <g fill={color}>{formas}</g>
    </g>
  )
}

const CONFITES: [number, number, number, string][] = [
  [70, 340, 20, 'var(--girasol)'],
  [108, 372, -35, 'var(--cobalto)'],
  [150, 336, 60, 'var(--menta)'],
  [250, 344, -20, 'var(--girasol)'],
  [292, 376, 40, 'var(--menta)'],
  [330, 338, -55, 'var(--cobalto)'],
  [86, 386, 75, 'var(--papel)'],
  [318, 392, 10, 'var(--papel)'],
]

function Vela({ apagada, indice }: { apagada: boolean; indice: number }) {
  return (
    <svg viewBox={`0 0 ${VELA_ANCHO} ${VELA_ALTO}`} className={estilos.velaDibujo} aria-hidden="true" style={{ '--i': indice } as CSSProperties}>
      <g className={estilos.palito}>
        <rect x="17" y="62" width="18" height="86" rx="4" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="3" />
        {[70, 92, 114, 136].map((y) => (
          <path key={y} d={`M18.5 ${y + 8} L33.5 ${y - 2} V${y + 6} L18.5 ${y + 16} Z`} fill="var(--tomate)" />
        ))}
        <rect x="17" y="62" width="18" height="86" rx="4" fill="none" stroke="var(--tinta)" strokeWidth="3" />
        <path d="M26 62V50" stroke="var(--tinta)" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* zona de toque generosa alrededor de la llama (invisible) */}
      <circle className={estilos.zonaToque} cx="26" cy="20" r="16" fill="transparent" data-toque />
      <g className={estilos.flama} data-apagada={apagada}>
        <path d="M26 2C37 18 42 31 38 42c-3 9-21 9-24 0-4-11 1-24 12-40Z" fill="var(--tomate)" stroke="var(--tinta)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M26 20c6 9 7 16 5 21-2 4-8 4-10 0-2-5-1-12 5-21Z" fill="var(--girasol)" />
      </g>
      {apagada && (
        <g className={estilos.humo}>
          <circle cx="26" cy="40" r="5" />
          <circle cx="24" cy="40" r="4" />
          <circle cx="28" cy="40" r="3.5" />
        </g>
      )}
    </svg>
  )
}

interface Props {
  apagadas: readonly boolean[]
  texto: string
  alApagar: (indice: number) => void
}

/** Pastel de dos pisos en SVG, con velas que son botones reales. */
export function Pastel({ apagadas, texto, alApagar }: Props) {
  const n = apagadas.length
  const posiciones = colocarVelas(n)
  const filas = filasDeVelas(n)
  // Con varias filas se ve la superficie de arriba del piso (vista un poco desde arriba).
  const fondoSuperficie = (filas - 1) * ELEVACION_FILA

  return (
    <div className={estilos.pastel}>
      <svg className={estilos.dibujo} viewBox={`0 0 ${ANCHO} ${ALTO}`} aria-hidden="true">
        {/* plato */}
        <ellipse cx="200" cy="404" rx="190" ry="20" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="4" />
        {/* piso inferior */}
        <rect x="28" y="290" width="344" height="114" rx="20" fill="var(--chicle)" stroke="var(--tinta)" strokeWidth="4" />
        <Glaseado x={28} y={288} ancho={344} gotas={[30, 46, 24, 38, 52, 28, 42, 22, 48, 34, 26]} color="var(--papel)" />
        {CONFITES.map(([x, y, r, c], i) => (
          <rect key={i} x={x - 9} y={y - 3.5} width="18" height="7" rx="3.5" fill={c} stroke="var(--tinta)" strokeWidth="2" transform={`rotate(${r} ${x} ${y})`} />
        ))}
        <text
          x="200"
          y="384"
          textAnchor="middle"
          fontFamily="var(--f-display)"
          fontWeight="800"
          fontSize="50"
          letterSpacing="4"
          fill="var(--papel)"
          stroke="var(--tinta)"
          strokeWidth="3"
          paintOrder="stroke"
        >
          {texto}
        </text>
        {/* piso superior */}
        <rect x="70" y={SUPERFICIE} width="260" height="84" rx="18" fill="var(--girasol)" stroke="var(--tinta)" strokeWidth="4" />
        {filas > 1 && (
          <ellipse
            cx="200"
            cy={SUPERFICIE + 6 - fondoSuperficie / 2}
            rx="130"
            ry={fondoSuperficie / 2 + 16}
            fill="var(--papel)"
            stroke="var(--tinta)"
            strokeWidth="4"
          />
        )}
        <Glaseado x={70} y={SUPERFICIE - 2} ancho={260} gotas={[26, 18, 34, 22, 30, 16, 28, 20, 32]} color="var(--papel)" />
        {[110, 160, 240, 290].map((x, i) => (
          <circle key={x} cx={x} cy={SUPERFICIE + 58 + (i % 2) * 8} r="6" fill="var(--tomate)" stroke="var(--tinta)" strokeWidth="2.5" />
        ))}
      </svg>

      {posiciones.map(({ x, elevacion, escala }, i) => (
        <button
          key={i}
          type="button"
          className={estilos.vela}
          style={{
            left: `${((x - (VELA_ANCHO * escala) / 2) / ANCHO) * 100}%`,
            top: `${((SUPERFICIE + 8 - elevacion - VELA_ALTO * escala) / ALTO) * 100}%`,
            width: `${((VELA_ANCHO * escala) / ANCHO) * 100}%`,
            height: `${((VELA_ALTO * escala) / ALTO) * 100}%`,
          }}
          aria-pressed={apagadas[i]}
          aria-label={`Vela ${i + 1} de ${n}${apagadas[i] ? ', apagada' : ''}`}
          onClick={() => alApagar(i)}
        >
          <Vela apagada={!!apagadas[i]} indice={i} />
        </button>
      ))}
    </div>
  )
}

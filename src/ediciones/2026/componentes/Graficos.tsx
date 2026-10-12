import { useId, type CSSProperties, type ReactNode } from 'react'
import estilos from './Graficos.module.css'

/** Lazo de regalo pequeño. Detalle, no tema. */
export function Lazo({ className, color = 'var(--tomate)' }: { className?: string | undefined; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 72" aria-hidden="true">
      <g stroke="var(--tinta)" strokeWidth="4" strokeLinejoin="round">
        <path d="M46 37 33 69l9-4 5 6 4-33Z M54 37l13 32-9-4-5 6-4-33Z" fill={color} />
        <path d="M50 33C31 4 4 8 8 31c3 18 28 14 42 2Z M50 33C69 4 96 8 92 31c-3 18-28 14-42 2Z" fill={color} />
        <path d="M22 22c8 1 16 5 23 10 M78 22c-8 1-16 5-23 10" fill="none" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="42" y="24" width="16" height="17" rx="6" fill={color} />
      </g>
    </svg>
  )
}

/** Sello postal circular: texto girando alrededor de la fecha. */
export function Sello({ texto, centro, className }: { texto: string; centro: string; className?: string | undefined }) {
  const id = useId().replace(/:/g, '')
  // La órbita mide ~465 unidades: textos largos usan letra más pequeña en vez de amontonarse.
  const tamOrbita = Math.min(17, 465 / (texto.length * 0.66))
  const tamCentro = Math.min(44, 104 / (centro.length * 0.55))
  return (
    <svg className={`${estilos.sello} ${className ?? ''}`} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id={`orbita-${id}`} d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
      </defs>
      <circle cx="100" cy="100" r="95" fill="var(--papel)" stroke="var(--tinta)" strokeWidth="4" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="var(--tinta)" strokeWidth="2.5" strokeDasharray="5 6" />
      <g className={estilos.selloGiro}>
        <text fontFamily="var(--f-display)" fontWeight="700" fontSize={tamOrbita} letterSpacing={tamOrbita * 0.14} fill="var(--tinta)">
          <textPath href={`#orbita-${id}`} textLength="462" lengthAdjust="spacing">
            {texto}
          </textPath>
        </text>
      </g>
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fontFamily="var(--f-display)"
        fontWeight="800"
        fontSize={tamCentro}
        fill="var(--tomate)"
        stroke="var(--tinta)"
        strokeWidth="2"
        paintOrder="stroke"
      >
        {centro}
      </text>
    </svg>
  )
}

function ondas(n: number, interior: number, exterior: number) {
  const punto = (r: number, a: number) => `${(100 + r * Math.cos(a)).toFixed(1)} ${(100 + r * Math.sin(a)).toFixed(1)}`
  let d = ''
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 0.5) / n) * Math.PI * 2
    const a2 = ((i + 1) / n) * Math.PI * 2
    d += `${i === 0 ? `M${punto(interior, a0)}` : ''} Q${punto(exterior, a1)} ${punto(interior, a2)}`
  }
  return `${d}Z`
}

const ONDAS = ondas(16, 86, 104)

/** Insignia ondulada tipo sticker. El texto es HTML real. */
export function Insignia({ children, color = 'var(--girasol)', className, style, escala = 1 }: { children: ReactNode; color?: string; className?: string | undefined; style?: CSSProperties; escala?: number }) {
  return (
    <div className={`${estilos.insignia} ${className ?? ''}`} style={{ ...style, '--escala': escala } as CSSProperties}>
      <svg viewBox="-8 -8 216 216" aria-hidden="true">
        <path d={ONDAS} fill="var(--tinta)" transform="translate(6 6)" />
        <path d={ONDAS} fill={color} stroke="var(--tinta)" strokeWidth="4" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

/** Trozo de cinta adhesiva semitransparente con bordes rasgados. */
export function Cinta({ className, style }: { className?: string | undefined; style?: CSSProperties }) {
  return <span className={`${estilos.cinta} ${className ?? ''}`} style={style} aria-hidden="true" />
}

/** Subrayado hecho a mano que se dibuja solo. */
export function Subrayado({ className }: { className?: string | undefined }) {
  return (
    <svg className={`${estilos.subrayado} ${className ?? ''}`} viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 12C42 3 82 15 122 8s70-6 95 1" pathLength="1" />
    </svg>
  )
}

/** Flecha curva dibujada a mano. */
export function Flecha({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 80 60" fill="none" stroke="var(--tinta)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 52C10 26 30 10 66 12" />
      <path d="M54 4l13 8-11 10" />
    </svg>
  )
}

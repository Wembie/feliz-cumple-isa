import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { avanzar, crearResorte, enReposo, type ParametrosResorte, type Resorte } from '../../../compartido/resorte'
import { useAjustarAncho } from '../../../compartido/Ajustado'
import { sonar } from '../../../compartido/sonido'
import { Lazo } from './Graficos'
import estilos from './LetrasVivas.module.css'

const COLORES = ['var(--tomate)', 'var(--cobalto)', 'var(--chicle)', 'var(--girasol)']

interface Arrastre {
  id: number
  inicioX: number
  inicioY: number
  baseX: number
  baseY: number
  ultX: number
  ultY: number
  ultT: number
  vx: number
  vy: number
  movido: boolean
}

interface Letra {
  x: Resorte
  y: Resorte
  r: Resorte
  s: Resorte
  p: ParametrosResorte
  retraso: number
  arrastre: Arrastre | null
}

const ESCALA: ParametrosResorte = { rigidez: 320, amortiguacion: 13 }

/**
 * Las letras gigantes de ISA!: caen con peso al cargar, se pueden lanzar y vuelven a su sitio.
 * `touch-action: pan-y` → un deslizamiento vertical sigue haciendo scroll; el arrastre lateral y
 * los toques son para jugar.
 */
export function LetrasVivas({ letras, etiqueta }: { letras: string; etiqueta: string }) {
  const caracteres = Array.from(letras)
  const nodos = useRef<(HTMLButtonElement | null)[]>([])
  const estado = useRef<Letra[]>([])
  const frame = useRef(0)
  const ultimo = useRef(0)
  const inicio = useRef(0)
  const grupo = useRef<HTMLDivElement>(null)
  useAjustarAncho(grupo, { partir: false })

  if (estado.current.length !== caracteres.length) {
    estado.current = caracteres.map((_, i) => {
      const rigidez = 150 + ((i * 37) % 70)
      return {
        x: crearResorte(),
        y: crearResorte(),
        r: crearResorte(),
        s: crearResorte(1),
        p: { rigidez, amortiguacion: 8.5 + (i % 3) * 1.6 },
        retraso: i * 0.085,
        arrastre: null,
      }
    })
  }

  const pintar = useCallback((i: number) => {
    const l = estado.current[i]
    const nodo = nodos.current[i]
    if (!l || !nodo) return
    nodo.style.transform = `translate3d(${l.x.valor.toFixed(2)}px, ${l.y.valor.toFixed(2)}px, 0) rotate(${l.r.valor.toFixed(2)}deg) scale(${l.s.valor.toFixed(4)})`
  }, [])

  const paso = useCallback(
    (ahora: number) => {
      const dt = Math.min((ahora - ultimo.current) / 1000, 1 / 20)
      ultimo.current = ahora
      const transcurrido = (ahora - inicio.current) / 1000
      let activo = false

      estado.current.forEach((l, i) => {
        if (transcurrido < l.retraso) {
          activo = true
          return
        }
        if (l.arrastre) {
          activo = true
          avanzar(l.r, l.p, dt)
        } else {
          avanzar(l.x, l.p, dt)
          avanzar(l.y, l.p, dt)
          avanzar(l.r, l.p, dt)
          avanzar(l.s, ESCALA, dt)
          if (!enReposo(l.x) || !enReposo(l.y) || !enReposo(l.r) || !enReposo(l.s, 0.002)) activo = true
          else {
            l.x.valor = l.y.valor = l.r.valor = 0
            l.s.valor = 1
            l.x.velocidad = l.y.velocidad = l.r.velocidad = l.s.velocidad = 0
          }
        }
        pintar(i)
      })

      frame.current = activo ? requestAnimationFrame(paso) : 0
    },
    [pintar],
  )

  const despertar = useCallback(() => {
    if (frame.current) return
    ultimo.current = performance.now()
    frame.current = requestAnimationFrame(paso)
  }, [paso])

  // Entrada: las letras caen desde arriba con rotaciones distintas, antes del primer pintado.
  useLayoutEffect(() => {
    inicio.current = performance.now()
    const altura = typeof window !== 'undefined' ? window.innerHeight : 800
    estado.current.forEach((l, i) => {
      l.y.valor = -(altura * 0.75 + i * 70)
      l.r.valor = (i % 2 ? 1 : -1) * (14 + i * 6)
      pintar(i)
    })
    despertar()
    return () => {
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [despertar, pintar])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const toque = (i: number) => {
    const l = estado.current[i]
    if (!l) return
    sonar('pop')
    l.y.velocidad = -620 - Math.random() * 260
    l.r.velocidad = (Math.random() < 0.5 ? -1 : 1) * (380 + Math.random() * 320)
    l.s.velocidad = 5
    despertar()
  }

  const alPresionar = (i: number) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    const l = estado.current[i]
    if (!l) return
    e.currentTarget.setPointerCapture(e.pointerId)
    l.arrastre = {
      id: e.pointerId,
      inicioX: e.clientX,
      inicioY: e.clientY,
      baseX: l.x.valor,
      baseY: l.y.valor,
      ultX: e.clientX,
      ultY: e.clientY,
      ultT: e.timeStamp,
      vx: 0,
      vy: 0,
      movido: false,
    }
    e.currentTarget.dataset.arrastrando = 'true'
    despertar()
  }

  const alMover = (i: number) => (e: PointerEvent<HTMLButtonElement>) => {
    const l = estado.current[i]
    const a = l?.arrastre
    if (!l || !a || a.id !== e.pointerId) return
    const dx = e.clientX - a.inicioX
    const dy = e.clientY - a.inicioY
    if (!a.movido && Math.hypot(dx, dy) > 6) a.movido = true
    const dt = Math.max(1, e.timeStamp - a.ultT) / 1000
    a.vx = a.vx * 0.6 + ((e.clientX - a.ultX) / dt) * 0.4
    a.vy = a.vy * 0.6 + ((e.clientY - a.ultY) / dt) * 0.4
    a.ultX = e.clientX
    a.ultY = e.clientY
    a.ultT = e.timeStamp
    l.x.valor = a.baseX + dx
    l.y.valor = a.baseY + dy
    l.r.objetivo = Math.max(-28, Math.min(28, a.vx * 0.025))
  }

  const soltar = (i: number, conImpulso: boolean) => (e: PointerEvent<HTMLButtonElement>) => {
    const l = estado.current[i]
    const a = l?.arrastre
    if (!l || !a || a.id !== e.pointerId) return
    l.arrastre = null
    l.r.objetivo = 0
    delete e.currentTarget.dataset.arrastrando
    if (!a.movido && conImpulso) {
      toque(i)
      return
    }
    if (conImpulso) {
      const tope = 2600
      l.x.velocidad = Math.max(-tope, Math.min(tope, a.vx))
      l.y.velocidad = Math.max(-tope, Math.min(tope, a.vy))
      l.r.velocidad = a.vx * 0.12
      if (Math.hypot(a.vx, a.vy) > 900) sonar('pop')
    }
    despertar()
  }

  const alTeclear = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const l = estado.current[i]
    if (!l) return
    const empuje: Record<string, [number, number]> = {
      ArrowLeft: [-700, 0],
      ArrowRight: [700, 0],
      ArrowUp: [0, -700],
      ArrowDown: [0, 700],
    }
    const v = empuje[e.key]
    if (!v) return
    e.preventDefault()
    l.x.velocidad += v[0]
    l.y.velocidad += v[1]
    despertar()
  }

  return (
    <div ref={grupo} className={estilos.letras} role="group" aria-label={etiqueta} data-solapable>
      {caracteres.map((c, i) => (
        <button
          key={i}
          type="button"
          ref={(n) => {
            nodos.current[i] = n
          }}
          className={estilos.letra}
          style={{ '--c': COLORES[i % COLORES.length], '--d': `${2.6 + (i % 3) * 0.45}s`, '--i': i } as CSSProperties}
          aria-label={`Letra ${c}: tócala para que salte`}
          onPointerDown={alPresionar(i)}
          onPointerMove={alMover(i)}
          onPointerUp={soltar(i, true)}
          onPointerCancel={soltar(i, false)}
          onLostPointerCapture={soltar(i, false)}
          onClick={(e) => {
            // Teclado (Enter/Espacio): el puntero ya se gestiona en pointerup.
            if (e.detail === 0) toque(i)
          }}
          onKeyDown={alTeclear(i)}
        >
          <span className={estilos.interior} aria-hidden="true">
            {c}
          </span>
          {i === caracteres.length - 1 && <Lazo className={estilos.lazo} />}
        </button>
      ))}
    </div>
  )
}

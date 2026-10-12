import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { MotorConfeti } from './motorConfeti'
import { sonar } from './sonido'

export interface OpcionesRafaga {
  cantidad?: number
  serpentinas?: number
  fuerza?: number
}

interface Confeti {
  celebrar: () => void
  rafaga: (x: number, y: number, opciones?: OpcionesRafaga) => void
}

const ContextoConfeti = createContext<Confeti>({ celebrar: () => {}, rafaga: () => {} })

/** Lienzo de confeti a pantalla completa, compartido por toda la edición. */
export function ProveedorConfeti({ children }: { children: ReactNode }) {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const motor = useRef<MotorConfeti | null>(null)

  useEffect(() => {
    if (!lienzo.current) return
    try {
      motor.current = new MotorConfeti(lienzo.current)
    } catch {
      motor.current = null
    }
    return () => {
      motor.current?.detener()
      motor.current = null
    }
  }, [])

  const celebrar = useCallback(() => {
    sonar('confeti')
    try {
      motor.current?.lanzar()
    } catch {
      /* si el lienzo falla, la celebración sigue en el texto y los stickers */
    }
  }, [])

  const rafaga = useCallback((x: number, y: number, opciones?: OpcionesRafaga) => {
    try {
      motor.current?.rafaga(x, y, opciones)
    } catch {
      /* sin confeti, sin drama */
    }
  }, [])

  const valor = useMemo(() => ({ celebrar, rafaga }), [celebrar, rafaga])

  return (
    <ContextoConfeti.Provider value={valor}>
      {children}
      <canvas
        ref={lienzo}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 80 }}
      />
    </ContextoConfeti.Provider>
  )
}

export function useCelebrar(): () => void {
  return useContext(ContextoConfeti).celebrar
}

export function useRafaga(): Confeti['rafaga'] {
  return useContext(ContextoConfeti).rafaga
}

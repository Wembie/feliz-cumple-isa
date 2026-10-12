import { useEffect, useState, type RefObject } from 'react'

/** `true` cuando el elemento entra en pantalla. Con `unaVez`, se queda en `true`. */
export function useEnPantalla<T extends Element>(
  ref: RefObject<T | null>,
  { unaVez = true, umbral = 0.2, margen = '0px' }: { unaVez?: boolean; umbral?: number; margen?: string } = {},
): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada) return
        if (entrada.isIntersecting) {
          setVisible(true)
          if (unaVez) observador.disconnect()
        } else if (!unaVez) {
          setVisible(false)
        }
      },
      { threshold: umbral, rootMargin: margen },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref, unaVez, umbral, margen])

  return visible
}

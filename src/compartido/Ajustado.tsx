import { useEffect, useLayoutEffect, useRef, type ElementType, type ReactNode, type RefObject } from 'react'

/**
 * Si una palabra no cabe a lo ancho (títulos gigantes, letras de ISA!…),
 * reduce el tamaño de letra justo lo necesario. Los textos que pueden
 * partirse en líneas lo siguen haciendo con normalidad.
 */
export function useAjustarAncho<T extends HTMLElement>(ref: RefObject<T | null>, { partir = true }: { partir?: boolean } = {}) {
  const ajustar = useRef<() => void>(() => {})

  ajustar.current = () => {
    const el = ref.current
    if (!el?.parentElement) return
    // Sin transición: medir a mitad de una transición daría tamaños falsos.
    el.style.transition = 'none'
    el.style.fontSize = ''
    // El ancho real disponible es el del contenedor más estrecho: los intermedios
    // pueden haberse estirado por culpa de la misma palabra larga.
    let disponible = document.documentElement.clientWidth
    for (let a: HTMLElement | null = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const estilo = getComputedStyle(a)
      const contenido = a.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight)
      if (contenido > 0) disponible = Math.min(disponible, contenido)
    }
    // Ancho que necesita: su palabra más larga si puede partirse en líneas, o la fila
    // entera si no (letras sueltas). Se mide así porque lo que se desborda centrado
    // hacia la izquierda no cuenta en scrollWidth.
    let ancho: number
    if (partir) {
      const { width, maxWidth } = el.style
      el.style.width = 'min-content'
      el.style.maxWidth = 'none'
      ancho = Math.max(el.offsetWidth, el.scrollWidth)
      el.style.width = width
      el.style.maxWidth = maxWidth
    } else {
      // Fila de letras: la suma directa de lo que ocupa cada una.
      ancho = Array.from(el.children).reduce((suma, hijo) => {
        const e = getComputedStyle(hijo)
        return suma + (hijo as HTMLElement).offsetWidth + parseFloat(e.marginLeft) + parseFloat(e.marginRight)
      }, 0)
    }
    if (disponible > 0 && ancho > disponible + 1) {
      const actual = parseFloat(getComputedStyle(el).fontSize)
      el.style.fontSize = `${Math.floor(actual * (disponible / ancho) * 0.95 * 10) / 10}px`
    }
  }

  // Cada render (el texto pudo cambiar) y cuando cambia el ancho disponible o cargan las fuentes.
  useLayoutEffect(() => ajustar.current())

  useEffect(() => {
    const el = ref.current
    const padre = el?.parentElement
    if (!el || !padre) return
    let frame = 0
    const programar = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => ajustar.current())
    }
    // Solo se vuelve a medir si cambia el ANCHO disponible (girar el celular, redimensionar),
    // nunca por los cambios del propio ajuste: así no hay ciclos.
    let ultimoAncho = padre.clientWidth
    const observador =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (padre.clientWidth === ultimoAncho) return
            ultimoAncho = padre.clientWidth
            programar()
          })
        : null
    observador?.observe(padre)
    // La tipografía definitiva puede llegar después del primer pintado.
    const ahora = () => ajustar.current()
    document.fonts?.ready.then(ahora).catch(() => {})
    document.fonts?.addEventListener('loadingdone', programar)
    const repasos = [250, 900, 2000].map((ms) => window.setTimeout(ahora, ms))
    return () => {
      observador?.disconnect()
      document.fonts?.removeEventListener('loadingdone', programar)
      repasos.forEach((t) => window.clearTimeout(t))
      cancelAnimationFrame(frame)
    }
  }, [ref])
}

/** Envoltorio de `useAjustarAncho` para títulos. */
export function Ajustado({
  as: Etiqueta = 'span',
  className,
  solapable = false,
  partir = true,
  children,
}: {
  as?: ElementType
  className?: string | undefined
  /** Titulares apilados con interlineado apretado: el solape es intencional. */
  solapable?: boolean
  /** `false` para filas que nunca se parten en líneas (letras sueltas). */
  partir?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  useAjustarAncho(ref, { partir })
  return (
    <Etiqueta ref={ref} className={className} data-solapable={solapable || undefined}>
      {children}
    </Etiqueta>
  )
}

/**
 * Escala (0–1) para que un texto quepa en un círculo: según su largo total
 * (el área crece con el cuadrado) y su palabra más larga.
 */
export function escalaCirculo(texto: string, capacidad: number, palabraMaxima: number): number {
  const limpio = texto.replace(/\[\[|\]\]/g, '')
  return Math.min(1, Math.sqrt(capacidad / Math.max(1, limpio.length)), palabraMaxima / palabraMasLarga(limpio))
}

/** Largo de la palabra más larga (para ajustar textos dentro de círculos). */
export function palabraMasLarga(texto: string): number {
  return Math.max(1, ...texto.replace(/\[\[|\]\]/g, '').split(/\s+/).map((p) => p.length))
}

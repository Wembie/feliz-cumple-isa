import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { Seguro } from './compartido/Seguro'
import { anioDesdeHash, EDICIONES, resolverEdicion, type PropsEdicion } from './ediciones/registro'

const cache = new Map<number, LazyExoticComponent<ComponentType<PropsEdicion>>>()

function componenteDe(anio: number) {
  let componente = cache.get(anio)
  if (!componente) {
    componente = lazy(resolverEdicion(anio).cargar)
    cache.set(anio, componente)
  }
  return componente
}

function Portada() {
  return (
    <div
      role="status"
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--papel)',
        font: '800 clamp(5rem, 30vw, 14rem)/1 var(--f-display)',
        color: 'var(--tomate)',
      }}
    >
      <span aria-label="Cargando tu regalo">ISA!</span>
    </div>
  )
}

function SinConexion() {
  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: '2rem', background: 'var(--girasol)', textAlign: 'center' }}>
      <div>
        <h1 style={{ font: '800 clamp(2.5rem, 10vw, 5rem)/1 var(--f-display)' }}>¡Feliz cumpleaños, Isa!</h1>
        <p style={{ margin: '1rem 0 1.5rem' }}>Tu regalo no terminó de cargar. Revisa la conexión y vuelve a intentarlo.</p>
        <button className="boton" type="button" onClick={() => location.reload()}>
          Volver a intentar
        </button>
      </div>
    </main>
  )
}

export function App() {
  const [anio, setAnio] = useState(() => resolverEdicion(anioDesdeHash(location.hash)).anio)

  useEffect(() => {
    // Solo los hashes con forma de año cambian de edición; cualquier otro se ignora.
    const alCambiar = () => {
      const pedido = anioDesdeHash(location.hash)
      if (pedido !== null) {
        setAnio(resolverEdicion(pedido).anio)
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const Edicion = componenteDe(anio)
  const otras = useMemo(
    () => EDICIONES.filter((e) => e.anio !== anio).map(({ anio, titulo }) => ({ anio, titulo })),
    [anio],
  )

  return (
    <Seguro alternativa={<SinConexion />}>
      <Suspense fallback={<Portada />}>
        <Edicion otras={otras} />
      </Suspense>
    </Seguro>
  )
}

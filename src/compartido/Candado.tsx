import { useEffect, useRef, useState, type FormEvent } from 'react'
import { derivarClave, descifrarTexto, exportarLlave, deBase64, importarLlave, type PaqueteCifrado } from './cifrado'
import estilos from './Candado.module.css'

export interface TextosCandado {
  etiqueta: string
  titulo: string
  texto: string
  pista: string
  campo: string
  mostrar: string
  ocultar: string
  recordar: string
  boton: string
  abriendo: string
  error: string
  sinContenido: string
  falloRed: string
}

type Estado = 'comprobando' | 'pidiendo' | 'abriendo' | 'sinContenido' | 'falloRed'

interface Props {
  anio: string
  textos: TextosCandado
  alAbrir: (datos: unknown, llave: CryptoKey) => void
}

/**
 * Pantalla de la palabra secreta. Antes de abrirla no se muestra nada del regalo:
 * los textos y las fotos están cifrados y solo se descifran aquí, en el dispositivo.
 * Si se marcó "recordar", se guarda la llave derivada (nunca la palabra) en este dispositivo.
 */
export function Candado({ anio, textos, alAbrir }: Props) {
  const [estado, setEstado] = useState<Estado>('comprobando')
  const [clave, setClave] = useState('')
  const [visible, setVisible] = useState(false)
  const [recordar, setRecordar] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  const paquete = useRef<PaqueteCifrado | null>(null)
  const campo = useRef<HTMLInputElement>(null)
  const claveGuardada = (sal: string) => `isa:llave:${anio}:${sal}`

  useEffect(() => {
    let vigente = true
    ;(async () => {
      try {
        const respuesta = await fetch(`${import.meta.env.BASE_URL}privado/${anio}/contenido.enc`, { cache: 'no-cache' })
        if (respuesta.status === 404) return vigente && setEstado('sinContenido')
        if (!respuesta.ok) throw new Error(String(respuesta.status))
        paquete.current = (await respuesta.json()) as PaqueteCifrado
      } catch {
        return vigente && setEstado('falloRed')
      }
      // ¿Ya se abrió antes en este dispositivo? Con `?candado` en la dirección se pide igual, para
      // probarlo; `?candado=recordar` usa la llave recordada (así lo comprueban las pruebas).
      const parametros = new URLSearchParams(location.search)
      const probarCandado = parametros.has('candado') && parametros.get('candado') !== 'recordar'
      try {
        const guardada = probarCandado ? null : localStorage.getItem(claveGuardada(paquete.current.sal))
        if (guardada) {
          const llave = await importarLlave(guardada)
          const datos = JSON.parse(await descifrarTexto(llave, paquete.current))
          if (vigente) alAbrir(datos, llave)
          return
        }
      } catch {
        try {
          localStorage.removeItem(claveGuardada(paquete.current.sal))
        } catch {
          /* almacenamiento bloqueado */
        }
      }
      if (vigente) setEstado('pidiendo')
    })()
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio])

  useEffect(() => {
    if (estado === 'pidiendo') campo.current?.focus()
  }, [estado])

  const abrir = async (e: FormEvent) => {
    e.preventDefault()
    const p = paquete.current
    if (!p || !clave.trim() || estado === 'abriendo') return
    setEstado('abriendo')
    setError(false)
    try {
      const llave = await derivarClave(clave, deBase64(p.sal), p.iteraciones, recordar)
      const datos = JSON.parse(await descifrarTexto(llave, p))
      if (recordar) {
        try {
          localStorage.setItem(claveGuardada(p.sal), await exportarLlave(llave))
        } catch {
          /* sin almacenamiento: se pedirá la próxima vez */
        }
      }
      alAbrir(datos, llave)
    } catch {
      setEstado('pidiendo')
      setError(true)
      setIntento((n) => n + 1)
      requestAnimationFrame(() => campo.current?.select())
    }
  }

  if (estado === 'comprobando') {
    return <main className={estilos.candado} aria-busy="true" />
  }

  return (
    <main className={estilos.candado}>
      <form className={estilos.tarjeta} onSubmit={abrir} key={intento} data-error={error}>
        <svg className={estilos.ilustracion} viewBox="0 0 120 120" aria-hidden="true">
          <path d="M36 54V40a24 24 0 0 1 48 0v14" fill="none" stroke="var(--tinta)" strokeWidth="9" strokeLinecap="round" />
          <rect x="22" y="50" width="76" height="58" rx="12" fill="var(--girasol)" stroke="var(--tinta)" strokeWidth="5" />
          <circle cx="60" cy="74" r="8" fill="var(--tinta)" />
          <path d="M60 78v14" stroke="var(--tinta)" strokeWidth="6" strokeLinecap="round" />
          <path d="M98 44c6-8 14-8 16 0-2 8-10 10-16 0Z M98 44c-2-10 4-16 10-12" fill="var(--tomate)" stroke="var(--tinta)" strokeWidth="3" strokeLinejoin="round" />
        </svg>

        <p className={estilos.etiqueta}>{textos.etiqueta}</p>
        <h1 className={estilos.titulo}>{textos.titulo}</h1>

        {estado === 'sinContenido' || estado === 'falloRed' ? (
          <p className={estilos.texto} role="status">
            {estado === 'sinContenido' ? textos.sinContenido : textos.falloRed}
          </p>
        ) : (
          <>
            <p className={estilos.texto}>{textos.texto}</p>
            {textos.pista && <p className={estilos.pista}>{textos.pista}</p>}

            <label className={estilos.campo}>
              <span className="solo-lectores">{textos.campo}</span>
              <input
                ref={campo}
                type={visible ? 'text' : 'password'}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder={textos.campo}
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={error}
                aria-describedby={error ? 'candado-error' : undefined}
                disabled={estado === 'abriendo'}
              />
              <button type="button" className={estilos.mostrar} onClick={() => setVisible(!visible)} aria-pressed={visible}>
                {visible ? textos.ocultar : textos.mostrar}
              </button>
            </label>

            <label className={estilos.recordar}>
              <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
              <span>{textos.recordar}</span>
            </label>

            {error && (
              <p id="candado-error" className={estilos.error} role="alert">
                {textos.error}
              </p>
            )}

            <button type="submit" className={`boton ${estilos.abrir}`} disabled={estado === 'abriendo' || !clave.trim()}>
              {estado === 'abriendo' ? textos.abriendo : textos.boton}
            </button>
          </>
        )}
      </form>
    </main>
  )
}

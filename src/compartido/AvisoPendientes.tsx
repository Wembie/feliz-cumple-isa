import { useState } from 'react'
import { listarPendientes } from './pendiente'

/**
 * Solo en desarrollo: recuerda cuántos marcadores quedan por completar en el contenido.
 * Nunca aparece en la versión publicada.
 */
export function AvisoPendientes({ contenido, fotosPendientes }: { contenido: unknown; fotosPendientes: number }) {
  const [abierto, setAbierto] = useState(false)
  const pendientes = listarPendientes(contenido)
  const total = pendientes.length + fotosPendientes
  if (total === 0) return null

  return (
    <aside
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 101,
        maxWidth: 'min(92vw, 380px)',
        background: '#191919',
        color: '#FFF5E6',
        border: '3px solid #191919',
        borderRadius: 14,
        font: '500 13px/1.4 var(--f-texto)',
        boxShadow: '4px 4px 0 #FFD84D',
      }}
    >
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        style={{ all: 'unset', cursor: 'pointer', display: 'block', padding: '10px 14px', minHeight: 24 }}
      >
        ✎ Modo desarrollo · {pendientes.length} textos y {fotosPendientes} fotos pendientes
      </button>
      {abierto && (
        <ul style={{ margin: 0, padding: '0 14px 12px 30px', maxHeight: '40vh', overflow: 'auto' }}>
          {pendientes.map((p, i) => (
            <li key={i}>
              <code style={{ color: '#FFD84D' }}>{p.ruta}</code> — {p.pista}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

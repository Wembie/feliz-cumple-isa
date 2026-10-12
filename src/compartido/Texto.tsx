import { fragmentar } from './pendiente'
import type { Texto as TipoTexto } from './tipos'
import estilos from './Texto.module.css'

/** Pinta un texto del contenido; los marcadores pendientes se ven como "✎ pista". */
export function Texto({ valor }: { valor: TipoTexto }) {
  return (
    <>
      {fragmentar(valor).map((f, i) =>
        f.tipo === 'texto' ? (
          f.valor
        ) : (
          <mark key={i} className={estilos.marcador} title="Marcador pendiente: edítalo en contenido.ts">
            <span aria-hidden="true">✎ </span>
            {f.pista}
          </mark>
        ),
      )}
    </>
  )
}

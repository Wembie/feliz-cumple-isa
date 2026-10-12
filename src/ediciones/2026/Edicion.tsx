import { useState } from 'react'
import { AvisoPendientes } from '../../compartido/AvisoPendientes'
import { Candado } from '../../compartido/Candado'
import { ProveedorConfeti } from '../../compartido/Confeti'
import { ControlSonido } from '../../compartido/ControlSonido'
import { ProveedorArchivos } from '../../compartido/archivos'
import { Seguro } from '../../compartido/Seguro'
import { Texto } from '../../compartido/Texto'
import { contarFotosPendientes } from '../../compartido/pendiente'
import type { Texto as TipoTexto } from '../../compartido/tipos'
import type { PropsEdicion } from '../registro'
import { CANDADO } from './candado'
import { crearContenido, type Constantes2026, type Contenido2026 } from './contenido'
import { constantesDirectas } from './fuente'
import { Carta } from './secciones/Carta'
import { Cierre } from './secciones/Cierre'
import { Deseo } from './secciones/Deseo'
import { Entrada } from './secciones/Entrada'
import { Mundo } from './secciones/Mundo'
import { Regalos } from './secciones/Regalos'

/** Alternativa sencilla si un efecto no se puede iniciar: nunca una sección vacía. */
function Sencilla({ titulo, texto }: { titulo: TipoTexto; texto: TipoTexto }) {
  return (
    <section style={{ padding: 'var(--e-8) var(--gutter)', borderTop: 'var(--borde)', background: 'var(--papel)' }}>
      <h2 style={{ font: '800 var(--t-xl)/1 var(--f-display)', marginBottom: 'var(--e-4)' }}>
        <Texto valor={titulo} />
      </h2>
      <p style={{ maxWidth: '40ch' }}>
        <Texto valor={texto} />
      </p>
    </section>
  )
}

/** Edición 2026 · POP EDITORIAL / PARTY COLLAGE */
/**
 * Edición 2026. Lo primero es el candado: hasta poner la palabra secreta no se muestra
 * nada del regalo (textos y fotos llegan cifrados). En desarrollo y pruebas se salta.
 */
export default function Edicion2026({ otras }: PropsEdicion) {
  const [abierto, setAbierto] = useState<{ contenido: Contenido2026; llave: CryptoKey | null } | null>(() =>
    constantesDirectas ? { contenido: crearContenido(constantesDirectas), llave: null } : null,
  )

  if (!abierto) {
    return (
      <Candado
        anio="2026"
        textos={CANDADO}
        alAbrir={(datos, llave) => setAbierto({ contenido: crearContenido(datos as Constantes2026), llave })}
      />
    )
  }

  return (
    <ProveedorArchivos llave={abierto.llave} anio="2026">
      <Experiencia c={abierto.contenido} otras={otras} />
    </ProveedorArchivos>
  )
}

function Experiencia({ c, otras }: { c: Contenido2026; otras: PropsEdicion['otras'] }) {
  return (
    <ProveedorConfeti>
      <ControlSonido config={c.sonido} />
      <Seguro alternativa={<Sencilla titulo={`${c.entrada.saludo} ${c.nombre}!`} texto={`${c.entrada.eslogan.antes} ${c.entrada.eslogan.destacado}`} />}>
        <Entrada contenido={c} />
      </Seguro>
      <main>
        <Seguro alternativa={<Sencilla titulo={`${c.deseo.titulo.linea1} ${c.deseo.titulo.linea2}`} texto={c.deseo.exito.texto} />}>
          <Deseo contenido={c} />
        </Seguro>
        <Seguro alternativa={<Sencilla titulo={`${c.mundo.titulo.pequeno} ${c.mundo.titulo.grande} ${c.mundo.titulo.etiqueta}`} texto={c.mundo.intro} />}>
          <Mundo contenido={c} />
        </Seguro>
        <Seguro alternativa={<Sencilla titulo={c.carta.saludo} texto={c.carta.parrafos.join('\n\n')} />}>
          <Carta contenido={c} />
        </Seguro>
        <Seguro alternativa={<Sencilla titulo={`${c.regalos.titulo.linea1} ${c.regalos.titulo.grande} ${c.regalos.titulo.etiqueta}`} texto={c.regalos.subtitulo} />}>
          <Regalos contenido={c} />
        </Seguro>
        <Seguro alternativa={<Sencilla titulo={c.cierre.frase} texto={c.cierre.subfrase} />}>
          <Cierre contenido={c} otras={otras} />
        </Seguro>
      </main>
      {import.meta.env.DEV && <AvisoPendientes contenido={c} fotosPendientes={contarFotosPendientes(c.mundo.fotos)} />}
    </ProveedorConfeti>
  )
}

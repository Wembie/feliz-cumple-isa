/**
 * Tipos base del contenido personal.
 * Cada edición define su propio contenido usando estas piezas.
 */

/** Texto visible. Puede ser un marcador pendiente creado con `pendiente()`. */
export type Texto = string

export type FormatoFoto = 'vertical' | 'horizontal' | 'cuadrada'

export type ColorSticker = 'girasol' | 'menta' | 'chicle' | 'tomate' | 'cobalto'

export interface Foto {
  /** Ruta dentro de `public/`, p. ej. `photos/2026/playa.webp`. `null` = foto pendiente. */
  src: string | null
  /** Descripción para lectores de pantalla. */
  alt: Texto
  /** Etiqueta corta que acompaña a la foto en el collage. */
  pie: Texto
  /** Nota personal que aparece al voltear la foto. */
  nota: Texto
  /** Proporción con la que se reserva el espacio de la foto. */
  formato: FormatoFoto
}

export interface StickerSecreto {
  /** Lo que se ve antes de tocarlo. */
  frente: Texto
  /** Lo que aparece al despegarlo: un apodo, un chiste interno… */
  secreto: Texto
  color: ColorSticker
}

// ── Regalos ──────────────────────────────────────────────────

/** Colores de la paleta disponibles para papel y cinta. */
export type ColorPaleta = 'tomate' | 'girasol' | 'cobalto' | 'chicle' | 'menta' | 'papel' | 'tinta'

/** Cómo se abre el paquete. */
export type AperturaRegalo =
  /** Clásico: la cinta se desata, el moño cae, la tapa se levanta. */
  | 'mono'
  /** Caja sorpresa: tiembla y la tapa salta con rebote. */
  | 'sorpresa'
  /** Sobre: la pegatina se despega, la solapa se abre y sale una carta. */
  | 'sobre'
  /** Misterio: da saltitos, gira y sale un muñeco de resorte. */
  | 'misterio'

export interface ImagenRegalo {
  /** Ruta dentro de `public/`. `null` = imagen pendiente. */
  src: string | null
  alt: Texto
  formato: FormatoFoto
}

/** Lo que hay dentro. Cada tipo pide solo los datos que necesita. */
export type ContenidoRegalo =
  | { tipo: 'mensaje'; texto: Texto }
  | { tipo: 'foto'; imagen: ImagenRegalo; pie: Texto }
  | { tipo: 'carta'; saludo: Texto; parrafos: Texto[]; firma: Texto }
  | {
      tipo: 'video'
      /** Ruta dentro de `public/` (mp4 recomendado). `null` = video pendiente. */
      src: string | null
      /** Imagen de portada opcional. */
      portada: string | null
      /** Subtítulos .vtt opcionales. */
      subtitulos: string | null
      /** Descripción del video para lectores de pantalla. */
      descripcion: Texto
    }
  | {
      tipo: 'fisico'
      nombre: Texto
      descripcion: Texto
      imagen: ImagenRegalo | null
      /** Botón opcional que descubre un mensaje adicional. */
      extra: { boton: Texto; mensaje: Texto } | null
    }
  | {
      /** Una caja que solo contiene otros regalos: al abrirla aparecen ellos, cada uno se abre aparte. */
      tipo: 'caja'
      /** Lo que se lee al abrirla, p. ej. "Espera… adentro hay más". */
      titulo: Texto
      regalos: Regalo[]
    }
  | { tipo: 'personalizada'; titulo: Texto; texto: Texto; imagen: ImagenRegalo | null; final: Texto }

export interface Regalo {
  /** Identificador único (sin espacios). */
  id: string
  /** Nombre del regalo: se ve al abrirlo y en el rótulo de los ya abiertos. */
  titulo: Texto
  /** Etiqueta colgante que se ve por fuera, antes de abrirlo. */
  etiqueta: Texto
  papel: ColorPaleta
  cinta: ColorPaleta
  /** Estampado del papel. */
  estampado: 'liso' | 'lunares' | 'rayas' | 'cuadros'
  /** Proporción de la caja (no aplica a la apertura `sobre`). */
  forma: 'cuadrada' | 'alta' | 'baja'
  apertura: AperturaRegalo
  contenido: ContenidoRegalo
  /** Mensaje que acompaña la sorpresa. `null` = sin mensaje. */
  mensaje: Texto | null
  /** `false` = se ve cerrado con candado y todavía no se puede abrir. */
  disponible: boolean
  /** El regalo principal (solo uno). Más grande, apertura más elaborada, clímax de la sección. */
  destacado?: boolean
}

export interface ConfigSonido {
  /** Muestra el botón de sonido. */
  disponible: boolean
  /** Estado inicial si Isa nunca lo ha cambiado. Solo suena al interactuar, nunca solo. */
  activoPorDefecto: boolean
  /** Volumen general de 0 a 1. */
  volumen: number
  /** Texto del botón según el estado. */
  textos: { activo: string; apagado: string }
}

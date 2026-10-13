/**
 * ═════════════════════════════════════════════════════════════
 *  PLANTILLA PÚBLICA DE TEXTOS · EDICIÓN 2026
 *
 *  ⚠ Aquí NO van tus textos reales: este archivo se publica en GitHub.
 *    Tus textos de verdad están en privado/2026/constantes.ts (Git lo
 *    ignora) y se publican cifrados con `npm run cifrar`.
 *
 *  Este archivo sirve de molde (misma estructura que el privado), para
 *  los tipos de TypeScript y para las pruebas automáticas.
 * ═════════════════════════════════════════════════════════════
 */
import { pendiente } from '../../compartido/pendiente'
import type { Foto, ImagenRegalo, Regalo, StickerSecreto } from '../../compartido/tipos'

// ── General ───────────────────────────────────────────────────
export const NOMBRE = 'Isa'
export const FECHA = { dia: '08', mes: '11', anio: '2026', larga: '8 de noviembre de 2026' }

export const SONIDO = {
  /** El sonido empieza activado (solo suena al tocar algo; nunca reproduce nada solo). */
  activoPorDefecto: true,
  volumen: 0.6,
  botonActivo: 'Sonido sí',
  botonApagado: 'Sonido no',
}

// ── 01 · La entrada ───────────────────────────────────────────
export const ENTRADA = {
  /** Cabecera de revista (arriba). */
  cabecera: 'Edición especial · Hecha a mano',
  saludo: '¡Feliz cumpleaños,',
  /** Las letras gigantes; cada carácter se puede arrastrar. */
  letras: 'ISA!',
  esloganAntes: 'Hoy el mundo celebra',
  esloganDestacado: 'que existes.',
  pista: 'psst… arrastra las letras',
  /** Sticker ondulado amarillo. */
  sticker: 'Hoy es tu día',
  /** Texto que gira alrededor del sello postal. */
  sello: 'EDICIÓN 2026 • SOLO PARA TI • HECHO A MANO • ',
  /** Cinta negra que se desplaza. */
  cinta: 'Feliz cumple',
  /** Botón redondo azul para bajar. */
  invitacion: 'Hay pastel',
}

// ── 02 · Pide un deseo ────────────────────────────────────────
export const DESEO = {
  antetitulo: 'Momento dos · el pastel',
  tituloLinea1: 'Pide un',
  tituloLinea2: 'deseo',
  instrucciones: 'Cierra los ojos, piensa en algo bonito y apaga las velas tocándolas una a una.',
  /** Velas del pastel (1 a 30). Más de 6 se acomodan en varias filas. */
  velas: 5,
  /** Lo que está escrito en el pastel. */
  textoPastel: 'ISA',
  contadorTodas: '{n} velas encendidas',
  contadorQuedan: 'Quedan {n} velas',
  contadorQueda: 'Queda 1 vela',
  botonSoplarTodas: 'Soplar todas',
  botonMicrofono: 'Soplar de verdad',
  escuchando: 'Te escucho… ¡sopla fuerte cerca del micrófono!',
  errorMicrofono: 'No pude usar el micrófono. Tranqui: toca las velas y listo.',
  exitoSticker: '¡Deseo pedido!',
  exitoTexto: 'No lo cuentes, que así se cumple.',
  reencender: 'Encender otra vez',
}

// ── 03 · Nuestro pequeño mundo ────────────────────────────────
export const MUNDO = {
  antetitulo: 'Momento tres · tú y yo',
  tituloPequeno: 'Nuestro',
  tituloGrande: 'pequeño',
  tituloEtiqueta: 'mundo',
  intro: 'Algunas fotos, algunos apodos y unos cuantos secretos que solo entendemos tú y yo.',
  pistaFotos: 'Toca una foto para verla en grande y darle la vuelta.',
  botonLeerNota: 'Leer la nota',
  botonVerFoto: 'Ver la foto',
  /** Aviso al pie de una nota larga (en el celular): hay más texto si deslizas. */
  notaDesliza: 'Desliza para leer más',
  /** Letrita debajo de cada sticker antes de despegarlo. */
  stickerTocame: 'tócame',
  fotoNoCarga: 'No se pudo cargar esta foto',
}

/** Fotos: el archivo va en privado/2026/fotos/ y en `src` escribes su nombre, p. ej. 'playa.jpg'. */
export const FOTOS: Foto[] = [
  {
    src: null,
    alt: pendiente('Describe la foto 1 para lectores de pantalla'),
    pie: pendiente('Título corto foto 1'),
    nota: pendiente('La historia detrás de la foto 1'),
    formato: 'vertical', // vertical | horizontal | cuadrada
  },
  {
    src: null,
    alt: pendiente('Describe la foto 2'),
    pie: pendiente('Título corto foto 2'),
    nota: pendiente('La historia detrás de la foto 2'),
    formato: 'horizontal',
  },
  {
    src: null,
    alt: pendiente('Describe la foto 3'),
    pie: pendiente('Título corto foto 3'),
    nota: pendiente('La historia detrás de la foto 3'),
    formato: 'cuadrada',
  },
  {
    src: null,
    alt: pendiente('Describe la foto 4'),
    pie: pendiente('Título corto foto 4'),
    nota: pendiente('La historia detrás de la foto 4'),
    formato: 'vertical',
  },
]

/** Stickers que se despegan: `frente` se ve antes, `secreto` al tocarlo. Colores: girasol, menta, chicle, tomate, cobalto. */
export const STICKERS: StickerSecreto[] = [
  { frente: 'Apodo nº 1', secreto: pendiente('Un apodo suyo'), color: 'girasol' },
  { frente: 'Chiste interno', secreto: pendiente('Un chiste que solo ustedes entienden'), color: 'chicle' },
  { frente: 'Top secret', secreto: pendiente('Otro apodo o frase de ustedes'), color: 'menta' },
]

/** Notitas sueltas entre las fotos. */
export const NOTAS: string[] = [pendiente('Una notita corta para el collage'), pendiente('Otra notita corta')]

// ── 04 · La carta ─────────────────────────────────────────────
export const CARTA = {
  antetitulo: 'Momento cuatro · para ti',
  tituloLinea1: 'Una carta',
  tituloLinea2: 'para Isa',
  /** Debajo del sobre cerrado. */
  pista: 'Toca el sobre para abrirlo',
  /** Escrito en el sobre. */
  remite: 'Entrega especial',
  para: 'Para:',
  /** Texto que gira en el sello de la carta. */
  sello: 'CORREO DE CUMPLEAÑOS',
  /** Cabecera de cada hoja. */
  membrete: 'correspondencia',

  saludo: 'Querida Isa:',

  /** Escribe tu carta aquí, tan larga como quieras. Línea en blanco = párrafo nuevo. */
  texto: `
${pendiente('Escribe aquí el primer párrafo de tu carta')}

${pendiente('Segundo párrafo: lo que significa para ti esta amistad')}

${pendiente('Tercer párrafo: lo que le deseas para este año')}
`,

  despedida: 'Feliz cumpleaños. Con todo mi cariño,',
  firma: pendiente('Tu nombre'),
  /** Posdata opcional, p. ej. 'P. D.: …'. `null` = sin posdata. */
  posdata: null as string | null,

  /**
   * Máximo de caracteres por hoja. Si la carta es más larga, sigue en la
   * hoja siguiente. 900 ≈ una hoja cómoda de leer en el celular.
   */
  caracteresPorHoja: 900,
  botonHojaAnterior: 'Hoja anterior',
  botonHojaSiguiente: 'Sigue leyendo',
  hoja: 'Hoja',
  de: 'de',
}

// ── 05 · Una cosita más para ti (regalos) ─────────────────────
export const REGALOS = {
  antetitulo: 'Momento cinco · regalos',
  tituloLinea1: 'Una cosita',
  tituloGrande: 'más',
  tituloEtiqueta: 'para ti…',
  subtitulo: 'Porque hoy mereces más de una sorpresa.',
  pista: 'Toca un paquete para abrirlo, en el orden que quieras.',
  /** Contador: "2 de 6 abiertos". */
  contadorDe: 'de',
  contadorAbiertos: 'abiertos',
  /** Al tocar un regalo con `disponible: false`. */
  bloqueado: 'Este todavía no se puede abrir. Paciencia…',
  botonVolverAVer: 'Volver a verlo',
  botonCerrar: 'Volver a los regalos',
  botonVerEnGrande: 'Ver en grande',
  botonVerPequena: 'Ver más pequeña',
  videoNoCarga: 'No se pudo cargar el video',
}

// Lo que hay dentro de cada regalo. `etiqueta` = la etiqueta colgante de fuera.
// Imágenes y videos: el archivo va en privado/2026/fotos/ y en `src` / `archivo` escribes su nombre.

export const REGALO_MENSAJE = {
  etiqueta: 'Para Isa',
  titulo: pendiente('Nombre del regalo 1'),
  texto: pendiente('Un mensaje corto escrito por ti'),
}

export const REGALO_FOTO = {
  etiqueta: 'Frágil',
  titulo: pendiente('Nombre del regalo 2'),
  imagen: { src: null, alt: pendiente('Describe la foto'), formato: 'vertical' } as ImagenRegalo,
  pie: pendiente('Pie de la foto'),
  mensaje: pendiente('Mensaje que acompaña la foto') as string | null,
}

export const REGALO_CARTA = {
  etiqueta: 'Correo urgente',
  titulo: pendiente('Nombre del regalo 3'),
  saludo: 'Isa:',
  /** Línea en blanco = párrafo nuevo. */
  texto: `
${pendiente('Una carta corta (distinta de la carta final)')}
`,
  firma: pendiente('Tu firma'),
}

/** ★ El regalo real: una caja grande que, al abrirla, tiene dentro los regalos de `dentro`. */
export const REGALO_REAL = {
  etiqueta: 'Este es de verdad',
  titulo: 'Tu regalo de verdad',
  /** Lo que se lee antes de los regalos que hay DENTRO de este. */
  dentroTitulo: 'Espera… adentro hay más',
  /**
   * Regalos que aparecen dentro del regalo real (cada uno se abre por separado).
   * Pon los que quieras; [] = ninguno. Colores: tomate, girasol, cobalto, chicle, menta, papel, tinta.
   * Aperturas: 'mono' | 'sorpresa' | 'sobre' | 'misterio'. Formas: 'cuadrada' | 'alta' | 'baja'.
   */
  dentro: [
    {
      id: 'dentro-1',
      titulo: pendiente('Nombre del regalo de dentro 1'),
      etiqueta: 'Uno',
      papel: 'girasol',
      cinta: 'tomate',
      estampado: 'lunares',
      forma: 'cuadrada',
      apertura: 'sorpresa',
      contenido: {
        tipo: 'fisico',
        nombre: pendiente('Qué es el primer regalo'),
        descripcion: pendiente('Lo que quieres decirle de este regalo'),
        imagen: null, // o { src: 'regalo-1.jpg', alt: '…', formato: 'cuadrada' }
        extra: null,
      },
      mensaje: null,
      disponible: true,
    },
    {
      id: 'dentro-2',
      titulo: pendiente('Nombre del regalo de dentro 2'),
      etiqueta: 'Dos',
      papel: 'chicle',
      cinta: 'cobalto',
      estampado: 'rayas',
      forma: 'alta',
      apertura: 'mono',
      contenido: {
        tipo: 'fisico',
        nombre: pendiente('Qué es el segundo regalo'),
        descripcion: pendiente('Lo que quieres decirle de este regalo'),
        imagen: null,
        extra: null,
      },
      mensaje: null,
      disponible: true,
    },
  ] as Regalo[],
}

export const REGALO_VIDEO = {
  etiqueta: '¿Qué crees que hay aquí?',
  titulo: pendiente('Nombre del regalo 5'),
  archivo: null as string | null, // p. ej. 'saludo.mp4'
  portada: null as string | null,
  subtitulos: null as string | null,
  descripcion: pendiente('De qué trata el video'),
  mensaje: pendiente('Mensaje que acompaña el video') as string | null,
}

export const REGALO_SORPRESA = {
  etiqueta: 'No agitar',
  titulo: pendiente('Nombre del regalo 6'),
  tituloSorpresa: pendiente('Título de la sorpresa'),
  texto: pendiente('Texto de la sorpresa'),
  imagen: null as ImagenRegalo | null,
  final: pendiente('Frase final'),
}

// ── Cierre ────────────────────────────────────────────────────
export const CIERRE = {
  frase: '¡Feliz cumpleaños!',
  subfrase: 'Que este año te devuelva todo lo bonito que das.',
  boton: 'Otra vez confeti',
  pie: 'Hecho a mano para Isa',
}

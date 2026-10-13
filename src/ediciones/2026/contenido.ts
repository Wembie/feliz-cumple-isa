/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENIDO · EDICIÓN 2026
 *  Cómo se arma la página: colores, formas y aperturas de los
 *  regalos y qué texto va en cada sitio.
 *
 *  ✎ TODOS los textos están en privado/2026/constantes.ts (privado,
 *    se publica cifrado). Para cambiar lo que dice la página no hace
 *    falta tocar este archivo.
 *
 *  · `pendiente('pista')` marca algo que falta escribir: en la página
 *    se ve como "✎ pista" en amarillo. En `npm run dev` aparece abajo
 *    a la izquierda un contador de marcadores pendientes.
 * ─────────────────────────────────────────────────────────────
 */
import { separarParrafos } from '../../compartido/carta'
import type { ConfigSonido, Foto, Regalo, StickerSecreto, Texto } from '../../compartido/tipos'
import type * as Ejemplo from './constantes.ejemplo'

/** Forma de las constantes de textos (la plantilla pública y la privada tienen la misma). */
export type Constantes2026 = typeof Ejemplo

export interface Contenido2026 {
  nombre: string
  /** Fecha del cumpleaños tal como se muestra en sellos y cabeceras. */
  fecha: { dia: string; mes: string; anio: string; larga: Texto }
  entrada: {
    cabecera: Texto
    saludo: Texto
    /** Las letras gigantes. Cada carácter es una pieza que se puede arrastrar. */
    letras: string
    eslogan: { antes: Texto; destacado: Texto }
    pista: Texto
    sticker: Texto
    sello: Texto
    cinta: Texto
    invitacion: Texto
  }
  deseo: {
    antetitulo: Texto
    titulo: { linea1: Texto; linea2: Texto }
    instrucciones: Texto
    /** Número de velas del pastel (entre 1 y 30). */
    velas: number
    textoPastel: Texto
    botonSoplarTodas: Texto
    botonMicrofono: Texto
    estadoEscuchando: Texto
    errorMicrofono: Texto
    exito: { sticker: Texto; texto: Texto }
    reencender: Texto
    /** Contador de velas; {n} = número. */
    contador: { todas: Texto; quedan: Texto; queda: Texto }
  }
  mundo: {
    antetitulo: Texto
    titulo: { pequeno: Texto; grande: Texto; etiqueta: Texto }
    intro: Texto
    pistaFotos: Texto
    fotos: Foto[]
    stickers: StickerSecreto[]
    /** Notitas sueltas que se intercalan en el collage. */
    notas: Texto[]
    botonLeerNota: Texto
    botonVerFoto: Texto
    notaDesliza: Texto
    stickerTocame: Texto
    fotoNoCarga: Texto
  }
  carta: {
    antetitulo: Texto
    titulo: { linea1: Texto; linea2: Texto }
    pista: Texto
    remite: Texto
    para: Texto
    sello: Texto
    membrete: Texto
    saludo: Texto
    parrafos: Texto[]
    /** Máximo de caracteres por hoja; lo que sobra pasa a la hoja siguiente. */
    caracteresPorHoja: number
    hojas: { anterior: Texto; siguiente: Texto; hoja: Texto; de: Texto }
    despedida: Texto
    firma: Texto
    posdata: Texto | null
  }
  regalos: {
    antetitulo: Texto
    titulo: { linea1: Texto; grande: Texto; etiqueta: Texto }
    subtitulo: Texto
    pista: Texto
    /** Textos del contador: se completa como "2 de 6 abiertos". */
    contador: { de: Texto; abiertos: Texto }
    bloqueado: Texto
    volverAVer: Texto
    cerrar: Texto
    verEnGrande: Texto
    verPequena: Texto
    videoNoCarga: Texto
    /** Los paquetes, en el orden en que aparecen. Agrega, quita o reordena libremente. */
    lista: Regalo[]
  }
  cierre: {
    frase: Texto
    subfrase: Texto
    boton: Texto
    pie: Texto
  }
  sonido: ConfigSonido
}

/** Arma el contenido de la página a partir de las constantes (descifradas o de la plantilla). */
export function crearContenido(T: Constantes2026): Contenido2026 {
  return {
    nombre: T.NOMBRE,
    fecha: T.FECHA,

    entrada: {
      cabecera: T.ENTRADA.cabecera,
      saludo: T.ENTRADA.saludo,
      letras: T.ENTRADA.letras,
      eslogan: { antes: T.ENTRADA.esloganAntes, destacado: T.ENTRADA.esloganDestacado },
      pista: T.ENTRADA.pista,
      sticker: T.ENTRADA.sticker,
      sello: T.ENTRADA.sello,
      cinta: T.ENTRADA.cinta,
      invitacion: T.ENTRADA.invitacion,
    },

    deseo: {
      antetitulo: T.DESEO.antetitulo,
      titulo: { linea1: T.DESEO.tituloLinea1, linea2: T.DESEO.tituloLinea2 },
      instrucciones: T.DESEO.instrucciones,
      velas: T.DESEO.velas,
      textoPastel: T.DESEO.textoPastel,
      botonSoplarTodas: T.DESEO.botonSoplarTodas,
      botonMicrofono: T.DESEO.botonMicrofono,
      estadoEscuchando: T.DESEO.escuchando,
      errorMicrofono: T.DESEO.errorMicrofono,
      exito: { sticker: T.DESEO.exitoSticker, texto: T.DESEO.exitoTexto },
      reencender: T.DESEO.reencender,
      contador: { todas: T.DESEO.contadorTodas, quedan: T.DESEO.contadorQuedan, queda: T.DESEO.contadorQueda },
    },

    mundo: {
      antetitulo: T.MUNDO.antetitulo,
      titulo: { pequeno: T.MUNDO.tituloPequeno, grande: T.MUNDO.tituloGrande, etiqueta: T.MUNDO.tituloEtiqueta },
      intro: T.MUNDO.intro,
      pistaFotos: T.MUNDO.pistaFotos,
      fotos: T.FOTOS,
      stickers: T.STICKERS,
      notas: T.NOTAS,
      botonLeerNota: T.MUNDO.botonLeerNota,
      botonVerFoto: T.MUNDO.botonVerFoto,
      notaDesliza: T.MUNDO.notaDesliza,
      stickerTocame: T.MUNDO.stickerTocame,
      fotoNoCarga: T.MUNDO.fotoNoCarga,
    },

    carta: {
      antetitulo: T.CARTA.antetitulo,
      titulo: { linea1: T.CARTA.tituloLinea1, linea2: T.CARTA.tituloLinea2 },
      pista: T.CARTA.pista,
      remite: T.CARTA.remite,
      para: T.CARTA.para,
      sello: T.CARTA.sello,
      membrete: T.CARTA.membrete,
      saludo: T.CARTA.saludo,
      parrafos: separarParrafos(T.CARTA.texto),
      caracteresPorHoja: T.CARTA.caracteresPorHoja,
      hojas: { anterior: T.CARTA.botonHojaAnterior, siguiente: T.CARTA.botonHojaSiguiente, hoja: T.CARTA.hoja, de: T.CARTA.de },
      despedida: T.CARTA.despedida,
      firma: T.CARTA.firma,
      posdata: T.CARTA.posdata,
    },

    // Regalos: aquí solo la forma de cada paquete (papel, cinta, estampado,
    // forma, apertura). Sus textos están en constantes.ts.
    //   Tipos de contenido: mensaje · foto · carta · video · fisico · personalizada
    //   Marca UNO con `destacado: true`: será el regalo principal.
    regalos: {
      antetitulo: T.REGALOS.antetitulo,
      titulo: { linea1: T.REGALOS.tituloLinea1, grande: T.REGALOS.tituloGrande, etiqueta: T.REGALOS.tituloEtiqueta },
      subtitulo: T.REGALOS.subtitulo,
      pista: T.REGALOS.pista,
      contador: { de: T.REGALOS.contadorDe, abiertos: T.REGALOS.contadorAbiertos },
      bloqueado: T.REGALOS.bloqueado,
      volverAVer: T.REGALOS.botonVolverAVer,
      cerrar: T.REGALOS.botonCerrar,
      verEnGrande: T.REGALOS.botonVerEnGrande,
      verPequena: T.REGALOS.botonVerPequena,
      videoNoCarga: T.REGALOS.videoNoCarga,
      lista: [
        {
          id: 'mensaje',
          titulo: T.REGALO_MENSAJE.titulo,
          etiqueta: T.REGALO_MENSAJE.etiqueta,
          papel: 'cobalto',
          cinta: 'chicle',
          estampado: 'lunares',
          forma: 'cuadrada',
          apertura: 'mono',
          contenido: { tipo: 'mensaje', texto: T.REGALO_MENSAJE.texto },
          mensaje: null,
          disponible: true,
        },
        {
          id: 'foto',
          titulo: T.REGALO_FOTO.titulo,
          etiqueta: T.REGALO_FOTO.etiqueta,
          papel: 'chicle',
          cinta: 'tomate',
          estampado: 'rayas',
          forma: 'alta',
          apertura: 'sorpresa',
          contenido: { tipo: 'foto', imagen: T.REGALO_FOTO.imagen, pie: T.REGALO_FOTO.pie },
          mensaje: T.REGALO_FOTO.mensaje,
          disponible: true,
        },
        {
          id: 'carta',
          titulo: T.REGALO_CARTA.titulo,
          etiqueta: T.REGALO_CARTA.etiqueta,
          papel: 'papel',
          cinta: 'tomate',
          estampado: 'liso',
          forma: 'cuadrada',
          apertura: 'sobre',
          contenido: {
            tipo: 'carta',
            saludo: T.REGALO_CARTA.saludo,
            parrafos: separarParrafos(T.REGALO_CARTA.texto),
            firma: T.REGALO_CARTA.firma,
          },
          mensaje: null,
          disponible: true,
        },
        {
          id: 'regalo-real',
          titulo: T.REGALO_REAL.titulo,
          etiqueta: T.REGALO_REAL.etiqueta,
          papel: 'tinta',
          cinta: 'tomate',
          estampado: 'rayas',
          forma: 'cuadrada',
          apertura: 'mono',
          destacado: true,
          // Solo una caja: al abrirla aparecen los regalos de dentro.
          contenido: { tipo: 'caja', titulo: T.REGALO_REAL.dentroTitulo, regalos: T.REGALO_REAL.dentro },
          mensaje: null,
          disponible: true,
        },
        {
          id: 'video',
          titulo: T.REGALO_VIDEO.titulo,
          etiqueta: T.REGALO_VIDEO.etiqueta,
          papel: 'menta',
          cinta: 'cobalto',
          estampado: 'cuadros',
          forma: 'baja',
          apertura: 'misterio',
          contenido: {
            tipo: 'video',
            src: T.REGALO_VIDEO.archivo,
            portada: T.REGALO_VIDEO.portada,
            subtitulos: T.REGALO_VIDEO.subtitulos,
            descripcion: T.REGALO_VIDEO.descripcion,
          },
          mensaje: T.REGALO_VIDEO.mensaje,
          disponible: true,
        },
        {
          id: 'sorpresa',
          titulo: T.REGALO_SORPRESA.titulo,
          etiqueta: T.REGALO_SORPRESA.etiqueta,
          papel: 'tomate',
          cinta: 'papel',
          estampado: 'lunares',
          forma: 'alta',
          apertura: 'sorpresa',
          contenido: {
            tipo: 'personalizada',
            titulo: T.REGALO_SORPRESA.tituloSorpresa,
            texto: T.REGALO_SORPRESA.texto,
            imagen: T.REGALO_SORPRESA.imagen,
            final: T.REGALO_SORPRESA.final,
          },
          mensaje: null,
          disponible: true,
        },
      ],
    },

    cierre: T.CIERRE,

    sonido: {
      disponible: true,
      activoPorDefecto: T.SONIDO.activoPorDefecto,
      volumen: T.SONIDO.volumen,
      textos: { activo: T.SONIDO.botonActivo, apagado: T.SONIDO.botonApagado },
    },
  }
}

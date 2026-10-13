/**
 * Vista previa del enlace: lo que se ve al compartir la página por WhatsApp, Telegram, iMessage…
 *
 * ⚠ PÚBLICO: esto lo ve cualquiera que reciba el enlace (y está en el repo). Nada secreto aquí.
 *
 * - Cambias `titulo`, `descripcion` o `nombreSitio` → se aplican solos al hacer build.
 * - Cambias algo de `imagen` → ejecuta `npm run vista-previa` para volver a dibujarla.
 * - WhatsApp guarda la vista previa en caché: si ya compartiste el enlace, prueba con
 *   `https://wembie.github.io/feliz-cumple-isa/?v=2` para que la vuelva a leer.
 */
export const VISTA_PREVIA = {
  /** Dirección pública de la página (con / al final). Las redes exigen la URL completa de la imagen. */
  url: 'https://wembie.github.io/feliz-cumple-isa/',
  /** Título en negrita de la tarjeta (y de la pestaña del navegador). */
  titulo: '¡ISA! 🎂 Feliz cumpleaños',
  /** Texto gris debajo del título. */
  descripcion: 'Hay algo esperándote aquí adentro. Ábrelo cuando estés lista. 🎁',
  /** Nombre del sitio (algunas apps lo muestran arriba del título). */
  nombreSitio: '¡ISA!',
  /** Color de la barra del navegador en el celular. */
  color: '#FFF5E6',
  /** Lo que se dibuja en la imagen (1200 × 630). */
  imagen: {
    /** El titular gigante. */
    grande: '¡ISA!',
    /** Cinta inclinada sobre el titular. */
    cinta: 'Feliz cumpleaños',
    /** Sticker redondo: fecha corta (dos líneas). */
    fecha: ['08', 'NOV'],
    /** Etiqueta pequeña abajo. */
    pie: 'Una página hecha a mano por Juan con mucho amor <3 · 2026',
    /** Descripción de la imagen para lectores de pantalla. */
    alt: 'Tarjeta de cumpleaños: ¡ISA! en letras gigantes con confeti',
  },
}

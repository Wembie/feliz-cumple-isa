# ISA! — Dirección visual · Edición 2026

> Pop editorial / party collage. Un póster de risografía que se puede tocar.

## Paleta (tokens en `src/estilos/tokens.css`)

| Token | Hex | Uso |
|---|---|---|
| `--tomate` | `#FF4D38` | Impacto: la "I", sello, cierre a sangre completa |
| `--girasol` | `#FFD84D` | Cintas, stickers, palabra clave dentro de un titular |
| `--cobalto` | `#3455DB` | Fondo completo del momento 2 (pastel), la "S" |
| `--chicle` | `#FF77B7` | Fondo del momento 4 (carta), la "A", glaseado |
| `--menta` | `#A8E6CF` | Etiquetas del collage, notas |
| `--papel` | `#FFF5E6` | Base editorial, carta, sobre |
| `--tinta` | `#191919` | Texto, bordes de 3 px, sombras duras |

Regla: cada sección = **1 fondo + 1 acento + tinta**. Nunca los siete a la vez.

| Momento | Fondo | Acento |
|---|---|---|
| 1 · ¡ISA! | papel | tomate / cobalto / chicle / girasol (una por letra) |
| 2 · Pide un deseo | cobalto | girasol |
| 3 · Nuestro pequeño mundo | papel | menta (+ girasol en cintas) |
| 4 · La carta | chicle | tomate (sello) |
| 5 · Regalos | girasol | tomate / cobalto (cada paquete con su papel y cinta) |
| Cierre | tomate | papel + girasol |

## Tipografía

- **Bricolage Grotesque** (OFL, variable `wght 200–800`, `wdth 75–100`): `ISA!` a 800 y titulares. El eje de ancho se usa como recurso: titulares comprimidos (`wdth 75`) contra palabras anchas.
- **Instrument Sans** (OFL, variable `wght 400–700`): instrucciones, notas y la carta.
- Ambas empaquetadas localmente vía `@fontsource-variable` → no dependen de ningún CDN.

Escala fluida (`clamp`): `ISA!` ≈ 38vw en móvil (máx. 22rem) · titulares 3–7.5rem · cuerpo 1.0625–1.1875rem · carta 1.125–1.25rem con `line-height 1.65` y `max-width 34em`.

## Espaciado y composición

- Escala base 4 px: `--e-1 … --e-9` (4, 8, 12, 16, 24, 32, 48, 72, 112 px).
- Gutter móvil 16–20 px. Escritorio: retícula de 12 columnas, máx. 1320 px.
- Asimetría deliberada: titulares que rompen la retícula, números de sección gigantes (`01`, `02`…) como en una revista.
- En móvil las composiciones se **rediseñan** (columna con offsets alternos), no se encogen.

## Texturas y elementos gráficos

- Grano de risografía: ruido SVG inline al 7 % sobre todo el documento (`mix-blend-mode: multiply`).
- Tramas de semitono (`radial-gradient`) en los fondos de color.
- Bordes de tinta de 3 px y sombras duras `6px 6px 0`. Cero blur, cero glow.
- Cinta adhesiva semitransparente, stickers con borde grueso, etiquetas de precio, sello postal circular con texto en órbita (`textPath`), un lazo pequeño sobre la `!`.

## Los cuatro momentos (boceto)

```
01 ENTRADA (papel)                     02 DESEO (cobalto)
┌──────────────────────────┐           ┌──────────────────────────┐
│ EDICIÓN 2026 · 08.11 ····│           │ 02          PIDE UN      │
│ ¡Feliz cumpleaños,       │           │             ▒DESEO▒      │
│ ┏━━┓┏━━┓┏━━┓┏┓  ⟲ sello  │           │      ı ı ı ı ı  ← velas  │
│ ┃I ┃┃S ┃┃A ┃┃!┃🎀        │           │   ╭──────────────╮       │
│ ┗━━┛┗━━┛┗━━┛┗┛           │           │   │ pastel SVG   │       │
│ ════ FELIZ CUMPLE ═══════│ ← cinta   │   ╰──────────────╯       │
│ [Hoy el mundo celebra…]  │           │  3 de 5 velas · [soplar] │
│        desliza ↓         │           └──────────────────────────┘
└──────────────────────────┘
03 MUNDO (papel)                       04 CARTA (chicle) + CIERRE (tomate)
┌──────────────────────────┐           ┌──────────────────────────┐
│ nuestro PEQUEÑO [mundo]  │           │      ╱╲  sobre           │
│  ┌────┐   (apodo)        │           │     ╱  ╲  [sello]        │
│  │foto│ ┌──────┐         │           │    └────┘  → carta        │
│  └────┘ │ foto │ ◯chiste │           │ ─────────────────────── │
│ ◯       └──────┘ ┌───┐   │           │    I S A !  (tomate)     │
│     ┌────────┐   │fot│   │           │  frase final · [otra vez]│
└──────────────────────────┘           └──────────────────────────┘
```

## Estrategia de animación (niveles de energía)

| Momento | Energía | Lenguaje |
|---|---|---|
| Entrada | Alta, < 1 s | Letras caen con resorte (masa/rigidez distintas por letra), stickers entran desde bordes distintos, cinta en marquesina lenta. El saludo es visible desde el primer frame. |
| Deseo | Explosiva | Llamas con parpadeo en CSS, humo al apagar, confeti en canvas 2D desde dos cañones + serpentinas. Máx. ~220 partículas, el bucle se detiene solo. |
| Mundo | Tranquila | Fotos "colocadas sobre la mesa" (escala 1.08 → 1 + sombra que crece), stickers que se despegan al tocarlos, parallax muy leve. |
| Carta | Cálida | Solapa que gira en 3D, la carta sube y se despliega (clip-path), párrafos con revelado corto. |
| Regalos | Juguetona → clímax | Cada paquete se abre distinto (moño, sorpresa, sobre, misterio) con anticipación, rebote y asentamiento; ráfaga de confeti local desde la caja (no los cañones). El regalo principal: redoble, rayos de trama y ~1,9 s. |
| Cierre | Festiva | `ISA!` en ola + confeti al entrar en pantalla, botón para repetir. |

Física propia: un resorte amortiguado de ~40 líneas (`src/compartido/resorte.ts`) mueve las letras; el bucle `requestAnimationFrame` duerme cuando todo está en reposo.

Movimiento siempre completo: por decisión de diseño, la experiencia muestra todas sus animaciones aunque el dispositivo tenga activada la opción "reducir movimiento".

Textos de cualquier largo: los textos se parten en líneas, los titulares gigantes y las letras se reducen solos si una palabra no cabe (`src/compartido/Ajustado.tsx`) y los stickers redondos ajustan su letra al largo del texto. `npm run estres` lo comprueba con todos los textos alargados.

## Stack y justificación

| Dependencia | Por qué |
|---|---|
| Vite + React + TypeScript estricto | Pedido; componentes pequeños, división por edición con `import()` |
| `@fontsource-variable/*` | Fuentes locales con licencia OFL, sin CDN |
| — (sin librería de animación) | Resortes, confeti y transiciones caben en < 6 KB propios; Motion/GSAP no aportarían lo suficiente |
| — (sin Three.js / física) | Todo es 2D: SVG + CSS + Canvas |
| Web Audio API | Efectos sintetizados en el navegador: sin archivos, sin licencias, apagado por defecto |
| Vitest · Playwright · ESLint | Pruebas de lógica, pruebas funcionales y capturas, calidad |
| `sharp` (solo dev) | Script opcional para optimizar fotos |

## Ediciones por año

Cada cumpleaños (8 de noviembre) tiene su propia carpeta `src/ediciones/<año>/` con su contenido **y su propio diseño**. La raíz muestra la edición actual; las anteriores siguen vivas en `#/2026`, `#/2027`… Cada edición se carga de forma diferida, así que agregar años no engorda la página.

## Orden del recorrido (actualizado)

01 ¡ISA! → 02 Pide un deseo → 03 Nuestro pequeño mundo → 04 La carta → 05 Regalos → cierre.
La carta va antes que los regalos: el momento íntimo llega con calma y los regalos (con el regalo real como clímax) suben la energía justo antes del cierre festivo. La carta larga se reparte en hojas (`CARTA.caracteresPorHoja` en constantes.ts) que se pasan como papel.

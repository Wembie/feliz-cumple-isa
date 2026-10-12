# ISA!

A one-of-a-kind interactive birthday experience made with love for Isa. Bold typography, playful interactions, colorful visual storytelling, and a personal birthday letter.

**Una página de cumpleaños hecha a mano para Isa · 8 de noviembre.**
Se publica en `https://wembie.github.io/feliz-cumple-isa/`. Cada año tiene su propia edición.

Dirección visual (paleta, tipografías, bocetos, animación): [docs/DIRECCION-VISUAL.md](docs/DIRECCION-VISUAL.md).

---

## Ejecutar en local

```bash
npm install
npm run dev          # http://localhost:5173/feliz-cumple-isa/
```

En modo desarrollo aparece abajo a la izquierda un contador **✎ marcadores pendientes**: ábrelo para ver exactamente qué falta escribir. En la versión publicada no aparece.

| Comando | Qué hace |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript estricto |
| `npm test` | Pruebas de lógica y de contenido (Vitest) |
| `npm run build` | Construye `dist/` |
| `npm run cifrar` | **Cifra tus textos y fotos** de `privado/2026/` con `CLAVE_2026` de `.env` → `public/privado/2026/` (`npm run cifrar -- 2027` para otro año) |
| `npm run build:prueba` | Construye la página de pruebas con la plantilla pública |
| `npm run e2e` | Pruebas funcionales en Chromium, móvil y escritorio (necesita `npm run build:prueba` antes) |
| `node scripts/capturas.mjs` | Capturas a 375/390/768/1440 px (con `npx vite preview --port 4173` corriendo) |
| `npm run estres` | **Prueba de estrés**: compila la página con todos los textos de `constantes.ts` mucho más largos y revisa a 320/375/390/768/1440 px que ningún texto quede cortado, fuera de pantalla o tapado |
| `npm run estres:real` | La misma revisión con tus textos reales (hazla después de cambiar `constantes.ts`) |
| `node scripts/capturas-regalos.mjs` | Capturas de la colección de regalos: cerrada, a mitad de cada apertura, abierta y cada diálogo |

## Personalizar el contenido (edición 2026)

**Todos los textos de la página están en `privado/2026/constantes.ts`**, ordenados por secciones de arriba a abajo (entrada, pastel, mundo, carta, regalos, cierre). Ahí van los títulos, botones y contadores, la carta, las fotos, los apodos y lo que hay dentro de cada regalo. Cámbialos como quieras.

> 🔒 **Privado:** la carpeta `privado/` **no se sube a GitHub**. Tus textos y fotos se publican **cifrados** (ver *Privacidad* más abajo).
>
> Si empiezas desde cero, copia la plantilla pública [src/ediciones/2026/constantes.ejemplo.ts](src/ediciones/2026/constantes.ejemplo.ts) como `privado/2026/constantes.ts` y cambia sus `import` a `'../../src/compartido/…'`.

[contenido.ts](src/ediciones/2026/contenido.ts) solo decide la forma: colores, estampados y aperturas de los regalos, y qué texto va en cada sitio. Para cambiar lo que dice la página no hace falta tocarlo.

- Cada `pendiente('…')` es un hueco por rellenar. Se ve en la página como un resaltado amarillo `✎ …` para que no se escape ninguno. Sustitúyelo por tu texto entre comillas:
  ```ts
  firma: pendiente('Juan'),   // antes: se ve en amarillo "✎ Juan"
  firma: 'Juan',              // después: se ve normal
  ```
- **Escribe textos del largo que quieras**: la página se adapta sola al celular (los textos se parten en líneas, los títulos gigantes y las letras se reducen si una palabra no cabe, los stickers redondos ajustan su letra). Después de cambiar textos, `npm run estres:real` confirma que todo encaja.
- `{n}` se reemplaza por un número (por ejemplo, `'Quedan {n} velas'`).
- No hay recuerdos, apodos ni fechas inventados: todo lo personal está marcado como pendiente.

### La carta (puede ser larga)

Escríbela en `CARTA.texto`, entre comillas invertidas, tan larga como quieras. **Deja una línea en blanco entre párrafos**:

```ts
texto: `
Isa, quiero empezar diciéndote que…

Este párrafo es otro. Puede ocupar
varias líneas del archivo sin problema.

Y este es el último.
`,
```

Si pasa de `CARTA.caracteresPorHoja` (900 por defecto, una hoja cómoda en el celular), la carta **sigue en la hoja siguiente**: Isa pasa de hoja con "Sigue leyendo →" y ve detrás un mazo con las hojas que faltan. Los párrafos muy largos se cortan entre frases, nunca a mitad de palabra. El saludo va en la primera hoja; la despedida, la firma y la posdata, en la última.

### Las fotos

1. Guarda las fotos (y videos) en **`privado/2026/fotos/`**. Esa carpeta no se sube.
2. En `FOTOS`, por cada foto rellena (en `src` va **solo el nombre del archivo**):
   ```ts
   {
     src: 'playa.jpg',
     alt: 'Isa riéndose en la playa',          // descripción para lectores de pantalla
     pie: 'Verano 2024',                       // etiqueta corta del collage
     nota: 'Lo que pasó ese día…',             // se lee al voltear la foto
     formato: 'horizontal',                    // vertical | horizontal | cuadrada
   }
   ```
   Funciona con una sola foto o con muchas. Si un nombre está mal, `npm test` lo avisa y la página muestra un marcador en vez de romperse.
3. ⚠ `alt` **no se ve**: es la descripción para lectores de pantalla. Lo que se ve es `pie` (la etiqueta) y `nota` (al voltear la foto). Con `src: null`, la foto no aparece.
4. Al cifrar, las fotos se reducen (máx. 1600 px) y se les quitan los metadatos (GPS, fecha, cámara).

### Apodos, chistes y notitas

- `STICKERS`: cada sticker muestra `frente` y, al tocarlo, se despega y revela `secreto`. Colores: `girasol`, `menta`, `chicle`, `tomate`, `cobalto`.
- `NOTAS`: notitas cortas que se intercalan entre las fotos.

### Los regalos (momento 5)

Seis paquetes con aperturas distintas: **moño** (la cinta se desata y el moño cae), **sorpresa** (tiembla y la tapa sale disparada), **sobre** (se despega la pegatina y sale una carta) y **misterio** (da saltitos, gira y sale un muñeco de resorte). Isa los abre en el orden que quiera, los vuelve a ver cuando quiera y un contador marca cuántos lleva.

- **Los textos** (etiqueta exterior y lo que hay dentro) se escriben en `constantes.ts` (`REGALO_MENSAJE`, `REGALO_FOTO`, `REGALO_CARTA`, `REGALO_REAL`, `REGALO_VIDEO`, `REGALO_SORPRESA`).
- **El regalo real** (`REGALO_REAL`): nombre, descripción, foto opcional y un botón "Hay algo más" con un mensaje escondido. En `contenido.ts` lleva `destacado: true`: es más grande, tiene rayos de risografía, redoble y una apertura más elaborada, y deja un botón "Volver a verlo".
- **Agregar, quitar o reordenar regalos**: edita `regalos.lista` en `contenido.ts`. Cada regalo tiene `id` único, `titulo`, `etiqueta` exterior, `papel` y `cinta` (colores de la paleta, incluido `tinta`), `estampado` (`liso`, `lunares`, `rayas`, `cuadros`), `forma` (`cuadrada`, `alta`, `baja`), `apertura`, `contenido`, `mensaje` (o `null`) y `disponible`.
- **Tipos de contenido**: `mensaje`, `foto` (se puede ampliar), `carta`, `video` (con controles, nunca se reproduce solo; mp4 en `public/videos/2026/`, opcionalmente con portada y subtítulos `.vtt`), `fisico` (el regalo real) y `personalizada` (imagen, texto y frase final).
- `disponible: false` muestra el paquete con candado y no deja abrirlo (por ejemplo, para algo que le entregarás más tarde).
- Solo un regalo puede ser `destacado`; `npm test` avisa si hay ids repetidos o dos destacados.

### Otros

- `DESEO.velas`: número de velas del pastel, de 1 a 30. Hasta 6 van en una fila; con más se acomodan en filas escalonadas (las de atrás más altas) y el pastel muestra su superficie vista desde arriba. Cada vela se apaga tocando su llama.
- `SONIDO.activoPorDefecto`: el sonido empieza **activado**. Solo suena cuando Isa toca algo (nunca reproduce nada por su cuenta) y el botón de arriba a la derecha lo silencia; su elección se recuerda. Los efectos se sintetizan en el navegador: no hay archivos de audio.

### El recorrido

01 ¡ISA! → 02 Pide un deseo → 03 Nuestro pequeño mundo → **04 La carta** → **05 Una cosita más para ti** (regalos) → cierre.

## Una edición nueva cada año

Cada cumpleaños vive en su carpeta `src/ediciones/<año>/` con su **propio contenido y su propio diseño**: el de un año no condiciona al siguiente.

1. Crea `src/ediciones/2027/` (puedes copiar 2026 como punto de partida o empezar de cero) con un `Edicion.tsx` que exporte por defecto el componente.
2. Regístrala en [src/ediciones/registro.ts](src/ediciones/registro.ts):
   ```ts
   { anio: 2027, titulo: 'Edición 2027', cargar: () => import('./2027/Edicion') },
   ```
3. Crea `privado/2027/` con su `constantes.ts` y `fotos/`, añade `CLAVE_2027=` al `.env` y ejecuta `npm run cifrar -- 2027`.

La raíz siempre muestra la edición más reciente. Las anteriores siguen vivas en `…/feliz-cumple-isa/#/2026`, y el pie de página enlaza discretamente a las demás. Cada edición se carga aparte, así que sumar años no hace más pesada la página.

Las piezas comunes (confeti, sonido, resortes, marcadores, micrófono) están en `src/compartido/` por si quieres reutilizarlas.

## Privacidad: palabra secreta y cifrado

El repositorio es público, pero tu regalo no:

- **Antes de la palabra secreta no se ve nada**: la página publicada solo muestra un candado. Sus textos están en [src/ediciones/2026/candado.ts](src/ediciones/2026/candado.ts), que es público: no pongas nada personal, y si usas una pista, que no regale la respuesta.
- **Tus textos y fotos viajan cifrados** (AES-256-GCM). La llave se deriva de la palabra secreta con PBKDF2 en 600 000 rondas. Se descifran solo en el dispositivo de Isa.
- **La palabra secreta nunca está en la página ni en el repositorio**: vive en tu `.env` y solo la usa `npm run cifrar`.
- **Una palabra secreta por año**: `CLAVE_2026`, `CLAVE_2027`… Cada edición se abre con la suya. `CLAVE_SECRETA` sirve de respaldo.
- Si Isa marca "Recordarla en este dispositivo", la próxima vez entra directo. Se guarda la llave derivada, no la palabra.

**Primera vez:**
1. Copia `.env.ejemplo` como **`.env`** y escribe tu palabra secreta en `CLAVE_2026=`. Mejor una frase de varias palabras que solo ustedes conozcan (12 o más caracteres): algo corto o adivinable, como su fecha de nacimiento, se puede romper probando.
2. `npm run cifrar`

**Mientras editas (`npm run dev`):**
- Con `.env`, la página funciona **igual que la publicada**: pide la palabra secreta y lo descifra todo.
- Cada vez que guardas algo en `privado/` (o cambias el `.env`), se **vuelve a cifrar solo** y la página se recarga. Como "recuerda" la llave, después de la primera vez entra directo.
- Para volver a ver el candado, añade **`?candado`** a la dirección: `http://localhost:5173/feliz-cumple-isa/?candado`.
- Sin `.env`, `npm run dev` muestra tus textos directamente, sin candado.
- Si cambias `vite.config.ts` o creas el `.env` con el servidor abierto, reinicia `npm run dev`.

**Antes de subir a GitHub:** sube también la carpeta `public/privado/`, que es lo cifrado. Si no tenías `npm run dev` abierto mientras editabas, ejecuta antes `npm run cifrar`. `npm run build` te avisa si los textos cambiaron sin volver a cifrar.

| Archivo | ¿Se sube a GitHub? |
|---|---|
| `privado/` (textos y fotos reales) | **No**, nunca |
| `.env` (palabra secreta) | **No**, nunca |
| `public/privado/` (versión cifrada) | **Sí**: ilegible sin la palabra |
| `src/ediciones/2026/candado.ts` (textos del candado) | Sí: público |

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub como `feliz-cumple-isa` (la ruta base ya está configurada en `vite.config.ts`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Antes de cada `push`: `npm run cifrar` (si cambiaste textos o fotos). Comprueba con `git status` que **no** aparecen `privado/` ni `.env`.
4. Cada `push` a `main` ejecuta [.github/workflows/pages.yml](.github/workflows/pages.yml): instala con `npm ci`, pasa lint, tipos, pruebas unitarias, pruebas funcionales y de estrés (con la plantilla pública) y publica. Si alguien subiera la carpeta `privado/`, la publicación falla.

Sin backend, sin servicios de pago, sin analítica ni rastreadores. La página no se indexa en buscadores (`noindex`).

## Créditos

- Tipografías: [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) e [Instrument Sans](https://github.com/Instrument/instrument-sans), ambas con licencia SIL Open Font License 1.1, empaquetadas localmente.
- Ilustraciones, confeti y sonidos: hechos para este proyecto (SVG, Canvas 2D y Web Audio).

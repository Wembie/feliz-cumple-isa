import { spawn } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VISTA_PREVIA } from './src/vistaPrevia'

const raiz = (ruta: string) => fileURLToPath(new URL(ruta, import.meta.url))

const PRIVADO = raiz('./privado/2026/constantes.ts')
const EJEMPLO = raiz('./src/ediciones/2026/constantes.ejemplo.ts')
const ESTRES = raiz('./tests/estres/constantes.ts')
const CIFRADO = raiz('./public/privado/2026/contenido.enc')

const TIPOS: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt' }

/**
 * Solo en `npm run dev`: sirve las fotos de privado/ para verlas sin cifrar mientras editas.
 * En la página publicada no existe: allí las fotos llegan cifradas.
 */
function fotosPrivadasEnDesarrollo(): Plugin {
  return {
    name: 'fotos-privadas-en-desarrollo',
    apply: 'serve',
    configureServer(servidor) {
      servidor.middlewares.use('/feliz-cumple-isa/__privado/', (pedido, respuesta, siguiente) => {
        const relativa = normalize(decodeURIComponent((pedido.url ?? '').split('?')[0] ?? '')).replace(/^([/\\])+/, '')
        const archivo = join(raiz('./privado'), relativa)
        if (relativa.includes('..') || !existsSync(archivo) || !statSync(archivo).isFile()) return siguiente()
        respuesta.setHeader('Content-Type', TIPOS[extname(archivo).toLowerCase()] ?? 'application/octet-stream')
        respuesta.end(readFileSync(archivo))
      })
    },
  }
}

/**
 * `npm run dev` con .env: funciona como la página publicada (candado + contenido cifrado).
 * Cada vez que guardas algo en privado/ o cambias .env, se vuelve a cifrar solo y la página se recarga.
 */
function cifradoAutomaticoEnDesarrollo(activo: boolean): Plugin {
  return {
    name: 'cifrado-automatico-en-desarrollo',
    apply: 'serve',
    configureServer(servidor) {
      if (!activo) {
        servidor.config.logger.warn('\n  Sin .env: npm run dev muestra tus textos sin candado. Crea .env (copia .env.ejemplo) para probar el candado.\n')
        return
      }
      const carpetaPrivada = raiz('./privado')
      const env = raiz('./.env')
      // Un año por carpeta: privado/2026/, privado/2027/… (cada uno con su CLAVE_<año>).
      const anios = () => readdirSync(carpetaPrivada).filter((a) => /^\d{4}$/.test(a) && existsSync(join(carpetaPrivada, a, 'constantes.ts')))
      let temporizador: ReturnType<typeof setTimeout> | undefined
      let cifrando = false
      const porCifrar = new Set<string>()

      const cifrarSiguiente = () => {
        const anio = porCifrar.values().next().value
        if (cifrando || !anio) return
        porCifrar.delete(anio)
        cifrando = true
        const proceso = spawn('npx', ['tsx', 'scripts/cifrar.ts', anio], { cwd: raiz('.'), shell: true })
        let salida = ''
        proceso.stdout.on('data', (d) => (salida += d))
        proceso.stderr.on('data', (d) => (salida += d))
        proceso.on('close', (codigo) => {
          cifrando = false
          if (codigo === 0) {
            servidor.config.logger.info(`  🔒 ${anio} cifrado de nuevo: recargando la página.`, { timestamp: true })
            servidor.ws.send({ type: 'full-reload' })
          } else {
            servidor.config.logger.error(`  ✗ No se pudo cifrar ${anio}:\n${salida.trim()}`, { timestamp: true })
          }
          cifrarSiguiente()
        })
      }
      const cifrar = (lista: string[]) => {
        lista.forEach((a) => porCifrar.add(a))
        clearTimeout(temporizador)
        temporizador = setTimeout(cifrarSiguiente, 600)
      }

      servidor.watcher.add([carpetaPrivada, env])
      servidor.watcher.on('all', (_evento, ruta) => {
        const archivo = normalize(ruta)
        if (archivo === env) cifrar(anios())
        else if (archivo.startsWith(carpetaPrivada + sep)) {
          const anio = archivo.slice(carpetaPrivada.length + 1).split(sep)[0] ?? ''
          if (/^\d{4}$/.test(anio)) cifrar([anio])
        }
      })
      cifrar(anios())
    },
  }
}

/** Al construir para publicar: avisa si tus textos cambiaron después del último `npm run cifrar`. */
/**
 * Título, descripción e imagen que se ven al compartir el enlace (WhatsApp, Telegram…).
 * Los textos salen de src/vistaPrevia.ts; la imagen, de `npm run vista-previa`.
 */
function vistaPrevia(): Plugin {
  const v = VISTA_PREVIA
  const meta = (atributo: 'name' | 'property', clave: string, valor: string) => ({
    tag: 'meta',
    attrs: { [atributo]: clave, content: valor },
    injectTo: 'head' as const,
  })
  const imagen = `${v.url}vista-previa.png`
  return {
    name: 'vista-previa',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => ({
        html: html.replace(/<title>.*?<\/title>/, () => `<title>${v.titulo.replace(/</g, '&lt;')}</title>`),
        tags: [
          meta('name', 'description', v.descripcion),
          meta('name', 'theme-color', v.color),
          meta('property', 'og:type', 'website'),
          meta('property', 'og:locale', 'es_ES'),
          meta('property', 'og:site_name', v.nombreSitio),
          meta('property', 'og:url', v.url),
          meta('property', 'og:title', v.titulo),
          meta('property', 'og:description', v.descripcion),
          meta('property', 'og:image', imagen),
          meta('property', 'og:image:secure_url', imagen),
          meta('property', 'og:image:type', 'image/png'),
          meta('property', 'og:image:width', '1200'),
          meta('property', 'og:image:height', '630'),
          meta('property', 'og:image:alt', v.imagen.alt),
          meta('name', 'twitter:card', 'summary_large_image'),
          meta('name', 'twitter:title', v.titulo),
          meta('name', 'twitter:description', v.descripcion),
          meta('name', 'twitter:image', imagen),
        ],
      }),
    },
  }
}

function avisoCifradoDesactualizado(): Plugin {
  return {
    name: 'aviso-cifrado-desactualizado',
    apply: 'build',
    buildStart() {
      if (!existsSync(PRIVADO)) return
      if (!existsSync(CIFRADO)) this.warn('No hay contenido cifrado: ejecuta `npm run cifrar` antes de publicar.')
      else if (statSync(PRIVADO).mtimeMs > statSync(CIFRADO).mtimeMs)
        this.warn('Tus textos privados cambiaron desde el último cifrado: ejecuta `npm run cifrar` antes de publicar.')
    },
  }
}

// La página vive en https://wembie.github.io/feliz-cumple-isa/
export default defineConfig(({ command, mode }) => {
  // Con .env, `npm run dev` funciona como la página publicada (candado + cifrado automático).
  const conCandadoEnDesarrollo = command === 'serve' && mode !== 'test' && existsSync(raiz('./.env')) && existsSync(PRIVADO)
  // Textos directos (sin candado): dev sin .env, pruebas y estrés. Al publicar, nunca.
  const directa = (command === 'serve' && !conCandadoEnDesarrollo) || mode === 'prueba' || mode === 'estres' || mode === 'real'
  const constantes =
    mode === 'estres' ? ESTRES : mode === 'prueba' ? EJEMPLO : existsSync(PRIVADO) && (command === 'serve' || mode === 'real') ? PRIVADO : EJEMPLO

  return {
    base: '/feliz-cumple-isa/',
    plugins: [react(), vistaPrevia(), fotosPrivadasEnDesarrollo(), cifradoAutomaticoEnDesarrollo(conCandadoEnDesarrollo), avisoCifradoDesactualizado()],
    resolve: {
      alias: [
        { find: '@constantes-2026', replacement: constantes },
        ...(directa ? [{ find: /^\.\/fuente$/, replacement: raiz('./src/ediciones/2026/fuente.directa.ts') }] : []),
      ],
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      outDir: { estres: 'dist-estres', prueba: 'dist-prueba', real: 'dist-real' }[mode] ?? 'dist',
    },
    test: {
      include: ['tests/**/*.test.ts'],
    },
  }
})

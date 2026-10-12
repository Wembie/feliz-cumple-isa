/**
 * Cifra tus textos y fotos para publicarlos sin que nadie más pueda verlos.
 *
 *   npm run cifrar            → edición 2026 con la clave de .env (CLAVE_2026)
 *   npm run cifrar -- 2027    → otra edición (CLAVE_2027)
 *
 * Lee:     privado/<año>/constantes.ts  y  privado/<año>/fotos/
 * Escribe: public/privado/<año>/contenido.enc  y  public/privado/<año>/f/*.enc
 *
 * Las fotos se reducen (máx. 1600 px) y se les quitan los metadatos (GPS, fecha, cámara)
 * antes de cifrarlas. Los originales nunca salen de privado/.
 *
 * Modo pruebas (lo usan las pruebas automáticas, no tú):
 *   tsx scripts/cifrar.ts --prueba  → cifra la plantilla pública con la clave "clave-de-prueba" en dist-prueba/
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { cifrarBytes, cifrarTexto, deBase64, derivarClave, ITERACIONES, salAleatoria, type PaqueteCifrado } from '../src/compartido/cifrado'

const args = process.argv.slice(2)
const prueba = args.includes('--prueba')
const anio = args.find((a) => /^\d{4}$/.test(a)) ?? '2026'

const RAIZ = resolve('.')
const ORIGEN = prueba ? resolve('src/ediciones', anio, 'constantes.ejemplo.ts') : resolve('privado', anio, 'constantes.ts')
const FOTOS = resolve('privado', anio, 'fotos')
const SALIDA = prueba ? resolve('dist-prueba/privado', anio) : resolve('public/privado', anio)
const IMAGENES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif', '.gif', '.tif', '.tiff'])
const CAMPOS_ARCHIVO = new Set(['src', 'archivo', 'portada', 'subtitulos'])

const salir = (mensaje: string): never => {
  console.error(`\n✗ ${mensaje}\n`)
  process.exit(1)
}

/** Una palabra secreta por año: CLAVE_<año> en .env (CLAVE_SECRETA sirve de respaldo). */
function leerClave(): string {
  if (prueba) return 'clave-de-prueba'
  const nombres = [`CLAVE_${anio}`, 'CLAVE_SECRETA']
  for (const nombre of nombres) {
    const valor = process.env[nombre]
    if (valor) return valor
  }
  const env = resolve('.env')
  if (!existsSync(env)) salir(`No encuentro el archivo .env. Copia .env.ejemplo como .env y escribe ahí CLAVE_${anio}=tu palabra secreta.`)
  const valores = new Map<string, string>()
  for (const linea of readFileSync(env, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(linea)
    if (m?.[1] && m[2]) valores.set(m[1], m[2].replace(/^(['"])(.*)\1$/, '$2'))
  }
  for (const nombre of nombres) {
    const valor = valores.get(nombre)
    if (valor) return valor
  }
  return salir(`En .env falta la línea CLAVE_${anio}=tu palabra secreta`)
}

/** Que privado/ y .env nunca se suban… y que la versión cifrada sí. */
function comprobarGitignore() {
  if (prueba) return
  const ignorado = (ruta: string) => {
    try {
      execSync(`git check-ignore -q "${ruta}"`, { cwd: RAIZ, stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }
  for (const ruta of [`privado/${anio}/constantes.ts`, '.env']) {
    if (!ignorado(ruta)) salir(`"${ruta}" NO está ignorado por Git: se subiría a GitHub. Revisa .gitignore antes de seguir.`)
  }
  if (ignorado(`public/privado/${anio}/contenido.enc`)) {
    salir('public/privado/ está ignorado por Git: la versión cifrada no se subiría y la página quedaría vacía. Revisa .gitignore.')
  }
}

function avisarSiClaveDebil(clave: string) {
  if (prueba) return
  const debil = clave.length < 12 || /^\d+$/.test(clave) || /^(.)\1+$/.test(clave)
  if (debil) {
    console.warn('\n⚠ Tu palabra secreta es corta o fácil de adivinar.')
    console.warn('  Alguien con tiempo podría probar combinaciones hasta dar con ella.')
    console.warn('  Mejor una frase de varias palabras que solo ustedes conozcan (12+ caracteres).\n')
  }
}

/** Reutiliza la sal anterior: así Isa no tiene que volver a escribir la clave si solo cambias textos. */
function salAnterior(): Uint8Array<ArrayBuffer> {
  const previo = join(SALIDA, 'contenido.enc')
  if (existsSync(previo)) {
    try {
      const paquete = JSON.parse(readFileSync(previo, 'utf8')) as PaqueteCifrado
      if (paquete.iteraciones === ITERACIONES) return deBase64(paquete.sal)
    } catch {
      /* archivo dañado: se genera otra sal */
    }
  }
  return salAleatoria()
}

async function prepararArchivo(nombre: string): Promise<{ datos: Uint8Array<ArrayBuffer>; extension: string }> {
  const ruta = resolve(FOTOS, nombre)
  if (!ruta.startsWith(FOTOS) || !existsSync(ruta)) salir(`No encuentro privado/${anio}/fotos/${nombre} (lo nombras en constantes.ts).`)
  const extension = extname(ruta).toLowerCase()
  if (IMAGENES.has(extension)) {
    // rotate() aplica la orientación del celular; sharp no copia los metadatos (GPS, fecha…) a la salida.
    const datos = await sharp(ruta).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    return { datos: new Uint8Array(datos), extension: 'webp' }
  }
  const tamano = statSync(ruta).size
  if (tamano > 90 * 1024 * 1024) salir(`${nombre} pesa ${(tamano / 1048576).toFixed(0)} MB: GitHub no acepta archivos de más de 100 MB. Comprímelo antes.`)
  if (tamano > 40 * 1024 * 1024) console.warn(`⚠ ${nombre} pesa ${(tamano / 1048576).toFixed(0)} MB: tardará en cargar en el celular.`)
  return { datos: new Uint8Array(readFileSync(ruta)), extension: extension.slice(1) }
}

async function principal() {
  if (!existsSync(ORIGEN)) salir(`No encuentro ${ORIGEN.replace(RAIZ, '.')}.`)
  comprobarGitignore()
  const clave = leerClave()
  avisarSiClaveDebil(clave)

  const modulo = (await import(pathToFileURL(ORIGEN).href)) as Record<string, unknown>
  const constantes = JSON.parse(JSON.stringify({ ...modulo })) as Record<string, unknown>

  const sal = salAnterior()
  console.log('Derivando la llave…')
  const llave = await derivarClave(clave, sal)

  rmSync(SALIDA, { recursive: true, force: true })
  mkdirSync(join(SALIDA, 'f'), { recursive: true })

  // Cambia cada nombre de foto/video por su archivo cifrado.
  const hechos = new Map<string, string>()
  let total = 0
  const recorrer = async (valor: unknown): Promise<unknown> => {
    if (Array.isArray(valor)) return Promise.all(valor.map(recorrer))
    if (valor && typeof valor === 'object') {
      const salida: Record<string, unknown> = {}
      for (const [clave, v] of Object.entries(valor)) {
        if (CAMPOS_ARCHIVO.has(clave) && typeof v === 'string' && v) {
          let ruta = hechos.get(v)
          if (!ruta) {
            const { datos, extension } = await prepararArchivo(v)
            const cifrado = await cifrarBytes(llave, datos)
            const nombre = `${hechos.size + 1}.${extension}.enc`
            writeFileSync(join(SALIDA, 'f', nombre), cifrado)
            total += cifrado.length
            ruta = `privado/${anio}/f/${nombre}`
            hechos.set(v, ruta)
            console.log(`  ✓ ${v} → f/${nombre} (${(cifrado.length / 1024).toFixed(0)} KB)`)
          }
          salida[clave] = ruta
        } else {
          salida[clave] = await recorrer(v)
        }
      }
      return salida
    }
    return valor
  }
  const final = await recorrer(constantes)

  const paquete = await cifrarTexto(llave, sal, JSON.stringify(final))
  writeFileSync(join(SALIDA, 'contenido.enc'), JSON.stringify(paquete))

  console.log(`\n✓ Cifrado listo: textos + ${hechos.size} archivo(s) (${(total / 1048576).toFixed(1)} MB) en ${SALIDA.replace(RAIZ, '.')}`)
  if (!prueba) console.log('  Ahora sube a GitHub la carpeta public/privado/ (privado/ y .env se quedan en tu computador).\n')
}

principal().catch((e) => salir(e instanceof Error ? e.message : String(e)))

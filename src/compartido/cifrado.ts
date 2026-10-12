/**
 * Cifrado del contenido privado (textos y fotos) con la Web Crypto API.
 * Funciona igual en el navegador y en Node (scripts/cifrar.ts).
 *
 * - La clave se deriva de la palabra secreta con PBKDF2-SHA256 (600 000 rondas):
 *   probar contraseñas a ciegas es muy lento.
 * - Cada archivo se cifra con AES-256-GCM y un IV aleatorio propio; si alguien
 *   altera un archivo, el descifrado falla en vez de mostrar basura.
 */

export const ITERACIONES = 600_000
const VERSION = 1

/** Lo que se publica en `contenido.enc`: todo menos la clave. */
export interface PaqueteCifrado {
  v: number
  /** Sal de la derivación (aleatoria por edición), en base64. */
  sal: string
  iteraciones: number
  iv: string
  datos: string
}

const sutil = () => globalThis.crypto.subtle

export function aBase64(bytes: Uint8Array): string {
  let binario = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binario)
}

export function deBase64(texto: string): Uint8Array<ArrayBuffer> {
  const binario = atob(texto)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes
}

export function salAleatoria(): Uint8Array<ArrayBuffer> {
  return globalThis.crypto.getRandomValues(new Uint8Array(16))
}

/** Normaliza la palabra secreta: sin espacios a los lados y sin distinguir tildes compuestas. */
export function normalizarClave(clave: string): string {
  return clave.trim().normalize('NFC')
}

export async function derivarClave(clave: string, sal: Uint8Array<ArrayBuffer>, iteraciones = ITERACIONES, exportable = false): Promise<CryptoKey> {
  const base = await sutil().importKey('raw', new TextEncoder().encode(normalizarClave(clave)), 'PBKDF2', false, ['deriveKey'])
  return sutil().deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: iteraciones },
    base,
    { name: 'AES-GCM', length: 256 },
    exportable,
    ['encrypt', 'decrypt'],
  )
}

/** Archivo binario cifrado: [versión][IV de 12 bytes][datos cifrados]. */
export async function cifrarBytes(llave: CryptoKey, bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const cifrado = new Uint8Array(await sutil().encrypt({ name: 'AES-GCM', iv }, llave, bytes))
  const salida = new Uint8Array(1 + iv.length + cifrado.length)
  salida[0] = VERSION
  salida.set(iv, 1)
  salida.set(cifrado, 1 + iv.length)
  return salida
}

export async function descifrarBytes(llave: CryptoKey, archivo: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  if (archivo[0] !== VERSION) throw new Error('Formato de archivo cifrado desconocido')
  const iv = archivo.subarray(1, 13)
  return new Uint8Array(await sutil().decrypt({ name: 'AES-GCM', iv }, llave, archivo.subarray(13)))
}

export async function cifrarTexto(llave: CryptoKey, sal: Uint8Array<ArrayBuffer>, texto: string, iteraciones = ITERACIONES): Promise<PaqueteCifrado> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const datos = new Uint8Array(await sutil().encrypt({ name: 'AES-GCM', iv }, llave, new TextEncoder().encode(texto)))
  return { v: VERSION, sal: aBase64(sal), iteraciones, iv: aBase64(iv), datos: aBase64(datos) }
}

/** Lanza un error si la llave no corresponde (AES-GCM verifica la integridad). */
export async function descifrarTexto(llave: CryptoKey, paquete: PaqueteCifrado): Promise<string> {
  const datos = await sutil().decrypt({ name: 'AES-GCM', iv: deBase64(paquete.iv) }, llave, deBase64(paquete.datos))
  return new TextDecoder().decode(datos)
}

/** Para recordar la llave en el dispositivo sin guardar la palabra secreta. */
export async function exportarLlave(llave: CryptoKey): Promise<string> {
  return aBase64(new Uint8Array(await sutil().exportKey('raw', llave)))
}

export async function importarLlave(guardada: string): Promise<CryptoKey> {
  return sutil().importKey('raw', deBase64(guardada), { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
}

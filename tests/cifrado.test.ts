import { describe, expect, it } from 'vitest'
import { cifrarBytes, cifrarTexto, deBase64, derivarClave, descifrarBytes, descifrarTexto, exportarLlave, importarLlave, salAleatoria } from '../src/compartido/cifrado'

// Menos rondas que en producción para que la prueba sea rápida; el algoritmo es el mismo.
const RONDAS = 1000

describe('cifrado', () => {
  it('cifra y descifra textos con la palabra correcta', async () => {
    const sal = salAleatoria()
    const llave = await derivarClave('una frase que solo ustedes saben', sal, RONDAS)
    const paquete = await cifrarTexto(llave, sal, '{"carta":"Querida Isa, ñandú y tildes"}', RONDAS)
    expect(paquete.datos).not.toContain('Isa')
    const otra = await derivarClave('una frase que solo ustedes saben', deBase64(paquete.sal), paquete.iteraciones)
    expect(await descifrarTexto(otra, paquete)).toBe('{"carta":"Querida Isa, ñandú y tildes"}')
  })

  it('con una palabra incorrecta no descifra nada', async () => {
    const sal = salAleatoria()
    const paquete = await cifrarTexto(await derivarClave('correcta', sal, RONDAS), sal, 'secreto', RONDAS)
    await expect(descifrarTexto(await derivarClave('incorrecta', sal, RONDAS), paquete)).rejects.toThrow()
  })

  it('ignora espacios accidentales al principio y al final de la palabra', async () => {
    const sal = salAleatoria()
    const paquete = await cifrarTexto(await derivarClave('nuestra frase', sal, RONDAS), sal, 'ok', RONDAS)
    expect(await descifrarTexto(await derivarClave('  nuestra frase ', sal, RONDAS), paquete)).toBe('ok')
  })

  it('cifra archivos (fotos) y detecta si alguien los altera', async () => {
    const llave = await derivarClave('clave', salAleatoria(), RONDAS)
    const foto = new Uint8Array([1, 2, 3, 250, 251, 252])
    const cifrada = await cifrarBytes(llave, foto)
    expect(Array.from(await descifrarBytes(llave, cifrada))).toEqual(Array.from(foto))
    cifrada[cifrada.length - 1]! ^= 1
    await expect(descifrarBytes(llave, cifrada)).rejects.toThrow()
  })

  it('la llave recordada en el dispositivo sirve sin guardar la palabra', async () => {
    const sal = salAleatoria()
    const llave = await derivarClave('clave', sal, RONDAS, true)
    const paquete = await cifrarTexto(llave, sal, 'hola', RONDAS)
    const guardada = await exportarLlave(llave)
    expect(guardada).not.toContain('clave')
    expect(await descifrarTexto(await importarLlave(guardada), paquete)).toBe('hola')
  })
})

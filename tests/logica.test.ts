import { describe, expect, it } from 'vitest'
import { fragmentar, listarPendientes, pendiente, textoPlano, esPendiente, contarFotosPendientes } from '../src/compartido/pendiente'
import { amortiguacionCritica, avanzar, crearResorte, enReposo } from '../src/compartido/resorte'
import { anioDesdeHash, resolverEdicion, type Edicion } from '../src/ediciones/registro'
import { paginar, partirParrafo, separarParrafos } from '../src/compartido/carta'
import { colocarVelas, limitarVelas } from '../src/ediciones/2026/velas'
import { componerCollage } from '../src/ediciones/2026/collage'
import { coreografiaDe, ordenEscritorio, revisarRegalos } from '../src/ediciones/2026/regalos'
import type { Foto, Regalo, StickerSecreto } from '../src/compartido/tipos'

describe('marcadores pendientes', () => {
  it('separa texto normal y marcadores', () => {
    expect(fragmentar(`Hola ${pendiente('nombre')}!`)).toEqual([
      { tipo: 'texto', valor: 'Hola ' },
      { tipo: 'pendiente', pista: 'nombre' },
      { tipo: 'texto', valor: '!' },
    ])
  })

  it('detecta y aplana marcadores', () => {
    expect(esPendiente(pendiente('x'))).toBe(true)
    expect(esPendiente('texto real')).toBe(false)
    expect(textoPlano(`Foto ${pendiente('algo')}`, 'pendiente')).toBe('Foto pendiente')
  })

  it('lista los marcadores con su ruta', () => {
    const contenido = { a: 'listo', b: [pendiente('uno'), { c: pendiente('dos') }] }
    expect(listarPendientes(contenido)).toEqual([
      { ruta: 'b[0]', pista: 'uno' },
      { ruta: 'b[1].c', pista: 'dos' },
    ])
  })

  it('cuenta fotos sin archivo', () => {
    expect(contarFotosPendientes([{ src: null }, { src: 'photos/2026/a.webp' }])).toBe(1)
  })
})

describe('resorte', () => {
  it('llega al objetivo y reposa', () => {
    const r = crearResorte(-500, 0)
    for (let i = 0; i < 300; i++) avanzar(r, { rigidez: 180, amortiguacion: 10 }, 1 / 60)
    expect(enReposo(r)).toBe(true)
  })

  it('con amortiguación crítica no rebota', () => {
    const r = crearResorte(-100, 0)
    let maximo = -Infinity
    for (let i = 0; i < 240; i++) {
      avanzar(r, { rigidez: 200, amortiguacion: amortiguacionCritica(200) }, 1 / 60)
      maximo = Math.max(maximo, r.valor)
    }
    expect(maximo).toBeLessThan(0.5)
  })

  it('un frame enorme (pestaña recuperada) no lo hace explotar', () => {
    const r = crearResorte(-100, 0)
    avanzar(r, { rigidez: 200, amortiguacion: 10 }, 30)
    expect(Number.isFinite(r.valor)).toBe(true)
    expect(Math.abs(r.valor)).toBeLessThan(200)
  })
})

describe('ediciones por año', () => {
  const falsa = (anio: number): Edicion => ({ anio, titulo: `Edición ${anio}`, cargar: async () => ({ default: () => null }) })
  const ediciones = [falsa(2026), falsa(2028), falsa(2027)]

  it('lee el año del hash', () => {
    expect(anioDesdeHash('#/2027')).toBe(2027)
    expect(anioDesdeHash('#/2027/')).toBe(2027)
    expect(anioDesdeHash('#deseo')).toBeNull()
    expect(anioDesdeHash('')).toBeNull()
  })

  it('elige el año pedido o el más reciente', () => {
    expect(resolverEdicion(2027, ediciones).anio).toBe(2027)
    expect(resolverEdicion(null, ediciones).anio).toBe(2028)
    expect(resolverEdicion(1999, ediciones).anio).toBe(2028)
  })
})

describe('collage', () => {
  const foto = (n: number): Foto => ({ src: null, alt: `a${n}`, pie: `p${n}`, nota: `n${n}`, formato: 'vertical' })
  const sticker = (n: number): StickerSecreto => ({ frente: `f${n}`, secreto: `s${n}`, color: 'menta' })

  it('intercala una nota cada dos fotos y pega stickers', () => {
    const { piezas, stickersSueltos } = componerCollage([foto(0), foto(1), foto(2), foto(3)], ['A', 'B'], [sticker(0), sticker(1)])
    expect(piezas.map((p) => p.tipo)).toEqual(['foto', 'foto', 'nota', 'foto', 'foto', 'nota'])
    expect(piezas[0]).toMatchObject({ tipo: 'foto', sticker: { frente: 'f0' } })
    expect(piezas[3]).toMatchObject({ tipo: 'foto', sticker: undefined })
    expect(stickersSueltos).toEqual([])
  })

  it('funciona con pocas o ninguna foto', () => {
    const una = componerCollage([foto(0)], ['A', 'B'], [sticker(0), sticker(1), sticker(2)])
    expect(una.piezas.map((p) => p.tipo)).toEqual(['foto', 'nota', 'nota'])
    expect(una.stickersSueltos).toHaveLength(2)
    expect(componerCollage([], [], []).piezas).toEqual([])
  })
})

describe('regalos', () => {
  const regalo = (id: string, extra: Partial<Regalo> = {}): Regalo => ({
    id,
    titulo: id,
    etiqueta: id,
    papel: 'tomate',
    cinta: 'papel',
    estampado: 'liso',
    forma: 'cuadrada',
    apertura: 'mono',
    contenido: { tipo: 'mensaje', texto: 'hola' },
    mensaje: null,
    disponible: true,
    ...extra,
  })

  it('pone el regalo principal en el centro de la mesa', () => {
    const lista = [regalo('a'), regalo('b', { destacado: true }), regalo('c'), regalo('d'), regalo('e')]
    const orden = ordenEscritorio(lista)
    expect(orden[1]).toBe(2)
    expect([...orden].sort()).toEqual([0, 1, 2, 3, 4])
    expect(ordenEscritorio([regalo('a'), regalo('b')])).toEqual([0, 1])
  })

  it('el regalo principal tiene una apertura más larga', () => {
    expect(coreografiaDe({ apertura: 'mono', destacado: true }).duracion).toBeGreaterThan(coreografiaDe({ apertura: 'mono' }).duracion)
    for (const apertura of ['mono', 'sorpresa', 'sobre', 'misterio'] as const) {
      const c = coreografiaDe({ apertura })
      expect(c.duracion).toBeLessThanOrEqual(1400)
      expect(c.rafaga.momento).toBeLessThan(1)
    }
  })

  it('detecta ids repetidos o inválidos y más de un destacado', () => {
    expect(revisarRegalos([regalo('a'), regalo('b')])).toEqual([])
    expect(revisarRegalos([regalo('a'), regalo('a')])).toHaveLength(1)
    expect(revisarRegalos([regalo('con espacio')])).toHaveLength(1)
    expect(revisarRegalos([regalo('a', { destacado: true }), regalo('b', { destacado: true })])).toHaveLength(1)
  })
})

describe('carta en hojas', () => {
  it('separa párrafos por líneas en blanco y une los saltos simples', () => {
    expect(separarParrafos('\n  Hola Isa,\nqué tal.\n\n\nSegundo párrafo.\n')).toEqual(['Hola Isa, qué tal.', 'Segundo párrafo.'])
  })

  it('una carta corta cabe en una sola hoja', () => {
    expect(paginar(['Uno.', 'Dos.'], 900)).toEqual([['Uno.', 'Dos.']])
    expect(paginar([], 900)).toEqual([[]])
  })

  it('lo que pasa del límite sigue en la hoja siguiente sin perder texto', () => {
    const parrafo = 'Esta es una frase de prueba bastante normal. '.repeat(10).trim()
    const parrafos = [parrafo, parrafo, parrafo]
    const hojas = paginar(parrafos, 300)
    expect(hojas.length).toBeGreaterThan(3)
    for (const hoja of hojas) expect(hoja.join('').length).toBeLessThanOrEqual(300)
    expect(hojas.flat().join(' ').replace(/\s+/g, ' ')).toBe(parrafos.join(' '))
  })

  it('parte un párrafo largo por frases y, si hace falta, por palabras', () => {
    expect(partirParrafo('Uno dos. Tres cuatro.', 12)).toEqual(['Uno dos.', 'Tres cuatro.'])
    const sinPuntos = 'palabra '.repeat(40).trim()
    expect(partirParrafo(sinPuntos, 100).every((p) => p.length <= 100)).toBe(true)
  })
})

describe('velas', () => {
  it('se limitan entre 1 y 30', () => {
    expect(limitarVelas(0)).toBe(1)
    expect(limitarVelas(45)).toBe(30)
  })

  it('cada cantidad produce exactamente esas velas, dentro del pastel', () => {
    for (let n = 1; n <= 30; n++) {
      const velas = colocarVelas(n)
      expect(velas).toHaveLength(n)
      for (const v of velas) {
        expect(v.x).toBeGreaterThanOrEqual(90)
        expect(v.x).toBeLessThanOrEqual(310)
      }
    }
  })

  it('hasta 6 van en una fila; más, en filas escalonadas', () => {
    expect(new Set(colocarVelas(6).map((v) => v.elevacion)).size).toBe(1)
    expect(new Set(colocarVelas(20).map((v) => v.elevacion)).size).toBe(4)
  })
})

/**
 * Efectos de sonido sintetizados con Web Audio: no hay archivos que cargar ni licencias.
 * Solo suena como respuesta a un gesto de la usuaria; el estado inicial viene del contenido.
 * Si el navegador no puede reproducirlo, todo sigue funcionando en silencio.
 */

export type Efecto = 'pop' | 'sticker' | 'soplo' | 'papel' | 'confeti' | 'ding' | 'cinta' | 'tapa' | 'redoble'

const CLAVE = 'isa:sonido'

/**
 * Ganancia general: los parlantes del celular son pequeños, así que se sube bastante y un
 * limitador (compresor) evita que se distorsione cuando suenan varios efectos a la vez.
 */
const REFUERZO = 1.8

let contexto: AudioContext | null = null
let salida: GainNode | null = null
let ruido: AudioBuffer | null = null
let volumen = 0.6
const guardado = leerPreferencia()
let activo = guardado ?? false
const oyentes = new Set<(activo: boolean) => void>()

function leerPreferencia(): boolean | null {
  try {
    const valor = localStorage.getItem(CLAVE)
    return valor === null ? null : valor === 'si'
  } catch {
    return null
  }
}

/** Estado inicial cuando nunca se ha tocado el botón (la preferencia guardada manda). */
export function aplicarPorDefecto(valor: boolean): void {
  if (guardado === null) activo = valor
}

export function sonidoActivo(): boolean {
  return activo
}

export function configurarVolumen(v: number): void {
  volumen = Math.min(1, Math.max(0, v))
  if (salida) salida.gain.value = volumen * REFUERZO
}

export function suscribirSonido(oyente: (activo: boolean) => void): () => void {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

export function activarSonido(valor: boolean): void {
  activo = valor
  try {
    localStorage.setItem(CLAVE, valor ? 'si' : 'no')
  } catch {
    /* almacenamiento bloqueado: la preferencia dura solo esta visita */
  }
  if (valor) {
    asegurarContexto()
    sonar('ding')
  }
  oyentes.forEach((o) => o(valor))
}

function asegurarContexto(): AudioContext | null {
  try {
    if (contexto?.state === 'closed') contexto = null
    if (!contexto) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      contexto = new Ctor()
      salida = contexto.createGain()
      salida.gain.value = volumen * REFUERZO
      const limitador = contexto.createDynamicsCompressor()
      limitador.threshold.value = -10
      limitador.knee.value = 6
      limitador.ratio.value = 12
      limitador.attack.value = 0.002
      limitador.release.value = 0.12
      salida.connect(limitador).connect(contexto.destination)
    }
    // 'suspended' (sin gesto, pestaña oculta) o 'interrupted' (iPhone: llamada, bloqueo, micrófono).
    if (contexto.state !== 'running') void contexto.resume().catch(() => {})
    return contexto
  } catch {
    return null
  }
}

type SesionAudio = { type: string }

function fijarSesion(tipo: 'playback' | 'play-and-record'): void {
  try {
    const sesion = (navigator as Navigator & { audioSession?: SesionAudio }).audioSession
    if (sesion) sesion.type = tipo
  } catch {
    /* navegador sin audioSession */
  }
}

/** Antes de pedir el micrófono (soplar las velas): el iPhone necesita grabar y reproducir a la vez. */
export function prepararMicrofono(): void {
  fijarSesion('play-and-record')
}

/**
 * Al soltar el micrófono, el iPhone deja el audio por el auricular de llamadas (muy bajito) o
 * interrumpido. Se vuelve al modo normal y se descarta el contexto: el siguiente sonido crea uno nuevo.
 */
export function liberarMicrofono(): void {
  fijarSesion('playback')
  const viejo = contexto
  contexto = null
  salida = null
  ruido = null
  void viejo?.close().catch(() => {})
}

/**
 * Celular: sin esto Web Audio se calla con el interruptor de silencio del iPhone, y el audio se queda
 * en pausa tras bloquear la pantalla o cambiar de app. Cada toque lo vuelve a poner en marcha.
 */
function prepararAudioMovil(): void {
  fijarSesion('playback')
  const despertar = () => {
    if (!activo) return
    const ctx = asegurarContexto()
    if (!ctx || ctx.state === 'running') return
    // Un instante de silencio dentro del gesto deja el contexto listo para los sonidos con retraso.
    try {
      const fuente = ctx.createBufferSource()
      fuente.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
      fuente.connect(ctx.destination)
      fuente.start()
    } catch {
      /* sin sonido, sin drama */
    }
  }
  ;['pointerdown', 'touchend', 'keydown'].forEach((e) => window.addEventListener(e, despertar, { capture: true, passive: true }))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && contexto && contexto.state !== 'running') void contexto.resume().catch(() => {})
  })
}

if (typeof window !== 'undefined') prepararAudioMovil()

function bufferRuido(ctx: AudioContext): AudioBuffer {
  if (ruido) return ruido
  const largo = Math.floor(ctx.sampleRate * 0.8)
  ruido = ctx.createBuffer(1, largo, ctx.sampleRate)
  const datos = ruido.getChannelData(0)
  for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1
  return ruido
}

function tono(ctx: AudioContext, destino: AudioNode, t: number, o: { tipo: OscillatorType; desde: number; hasta: number; dur: number; vol: number }) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = o.tipo
  osc.frequency.setValueAtTime(o.desde, t)
  osc.frequency.exponentialRampToValueAtTime(o.hasta, t + o.dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
  osc.connect(g).connect(destino)
  osc.start(t)
  osc.stop(t + o.dur + 0.02)
}

function soplido(ctx: AudioContext, destino: AudioNode, t: number, o: { dur: number; freq: number; q: number; vol: number; tipo: BiquadFilterType }) {
  const fuente = ctx.createBufferSource()
  fuente.buffer = bufferRuido(ctx)
  const filtro = ctx.createBiquadFilter()
  filtro.type = o.tipo
  filtro.frequency.setValueAtTime(o.freq, t)
  filtro.frequency.exponentialRampToValueAtTime(o.freq * 0.6, t + o.dur)
  filtro.Q.value = o.q
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.vol, t + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
  fuente.connect(filtro).connect(g).connect(destino)
  fuente.start(t)
  fuente.stop(t + o.dur + 0.05)
}

export function sonar(efecto: Efecto): void {
  if (!activo) return
  // Sin un primer gesto de la usuaria no suena nada (p. ej. el confeti que salta al hacer scroll).
  const activacion = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  if (activacion && !activacion.hasBeenActive) return
  const ctx = asegurarContexto()
  if (!ctx || !salida) return
  try {
    const t = ctx.currentTime + 0.01
    switch (efecto) {
      case 'pop':
        tono(ctx, salida, t, { tipo: 'sine', desde: 520 + Math.random() * 180, hasta: 160, dur: 0.14, vol: 0.5 })
        break
      case 'sticker':
        tono(ctx, salida, t, { tipo: 'triangle', desde: 900, hasta: 1500, dur: 0.07, vol: 0.25 })
        tono(ctx, salida, t + 0.06, { tipo: 'triangle', desde: 1300, hasta: 1900, dur: 0.08, vol: 0.18 })
        break
      case 'soplo':
        soplido(ctx, salida, t, { dur: 0.38, freq: 1100, q: 0.7, vol: 0.45, tipo: 'bandpass' })
        break
      case 'papel':
        soplido(ctx, salida, t, { dur: 0.32, freq: 3200, q: 0.4, vol: 0.18, tipo: 'highpass' })
        soplido(ctx, salida, t + 0.22, { dur: 0.4, freq: 2400, q: 0.5, vol: 0.14, tipo: 'highpass' })
        break
      case 'confeti':
        for (let i = 0; i < 7; i++) {
          tono(ctx, salida, t + i * 0.045 + Math.random() * 0.03, {
            tipo: 'sine',
            desde: 380 + Math.random() * 520,
            hasta: 120,
            dur: 0.12,
            vol: 0.28,
          })
        }
        ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          tono(ctx, salida!, t + 0.32 + i * 0.07, { tipo: 'triangle', desde: f, hasta: f * 0.995, dur: 0.6, vol: 0.14 }),
        )
        break
      case 'cinta':
        // Cinta que se desata: un siseo que sube.
        soplido(ctx, salida, t, { dur: 0.28, freq: 1800, q: 1.2, vol: 0.2, tipo: 'bandpass' })
        tono(ctx, salida, t + 0.05, { tipo: 'triangle', desde: 600, hasta: 1400, dur: 0.22, vol: 0.08 })
        break
      case 'tapa':
        // Tapa que salta: golpe sordo + pop.
        tono(ctx, salida, t, { tipo: 'triangle', desde: 220, hasta: 80, dur: 0.16, vol: 0.45 })
        tono(ctx, salida, t + 0.04, { tipo: 'sine', desde: 700, hasta: 220, dur: 0.12, vol: 0.3 })
        break
      case 'redoble':
        // Redoble corto antes del regalo principal.
        for (let i = 0; i < 14; i++) {
          soplido(ctx, salida, t + i * 0.055, { dur: 0.05, freq: 900 + i * 30, q: 0.9, vol: 0.06 + i * 0.012, tipo: 'bandpass' })
        }
        break
      case 'ding':
        tono(ctx, salida, t, { tipo: 'triangle', desde: 880, hasta: 876, dur: 0.35, vol: 0.18 })
        tono(ctx, salida, t + 0.08, { tipo: 'triangle', desde: 1318.5, hasta: 1312, dur: 0.4, vol: 0.12 })
        break
    }
  } catch {
    /* sin sonido, sin drama */
  }
}

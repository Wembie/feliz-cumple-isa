/**
 * Detección opcional de soplido con el micrófono.
 * Solo se pide permiso cuando la usuaria pulsa el botón; si falla, las velas se apagan tocándolas.
 */

export interface EscuchaSoplido {
  detener: () => void
}

export function microfonoDisponible(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.AudioContext !== 'undefined'
}

/**
 * Llama a `alSoplar` repetidamente mientras se detecta un soplido sostenido
 * (energía alta durante varios frames seguidos). Se detiene sola tras `limiteMs`.
 */
export async function escucharSoplido(alSoplar: () => void, limiteMs = 20000): Promise<EscuchaSoplido> {
  const flujo = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })
  const ctx = new AudioContext()
  const fuente = ctx.createMediaStreamSource(flujo)
  const analizador = ctx.createAnalyser()
  analizador.fftSize = 1024
  fuente.connect(analizador)
  const muestras = new Float32Array(analizador.fftSize)

  let frame = 0
  let sostenido = 0
  let detenido = false
  const limite = window.setTimeout(() => detener(), limiteMs)

  function medir() {
    if (detenido) return
    analizador.getFloatTimeDomainData(muestras)
    let suma = 0
    for (let i = 0; i < muestras.length; i++) suma += muestras[i]! * muestras[i]!
    const rms = Math.sqrt(suma / muestras.length)
    // Un soplido cerca del micrófono satura con ruido de banda ancha: RMS alto y sostenido.
    sostenido = rms > 0.12 ? sostenido + 1 : Math.max(0, sostenido - 2)
    if (sostenido >= 5 && sostenido % 6 === 5) alSoplar()
    frame = requestAnimationFrame(medir)
  }

  function detener() {
    if (detenido) return
    detenido = true
    cancelAnimationFrame(frame)
    window.clearTimeout(limite)
    flujo.getTracks().forEach((pista) => pista.stop())
    void ctx.close().catch(() => {})
  }

  medir()
  return { detener }
}

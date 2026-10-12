/**
 * Confeti, recortes y serpentinas en Canvas 2D.
 * - Máximo MAX_PARTICULAS a la vez; las más viejas se descartan.
 * - El bucle requestAnimationFrame se detiene solo cuando no queda nada que dibujar.
 */

type Forma = 'tira' | 'cuadro' | 'circulo' | 'triangulo' | 'serpentina'

interface Particula {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vrot: number
  giro: number
  vgiro: number
  ancho: number
  alto: number
  color: string
  forma: Forma
  borde: boolean
  arrastre: number
  gravedad: number
  fase: number
  edad: number
  vida: number
}

const COLORES = ['#FF4D38', '#FFD84D', '#3455DB', '#FF77B7', '#A8E6CF', '#FFF5E6']
const TINTA = '#191919'
const MAX_PARTICULAS = 260

const azar = (min: number, max: number) => min + Math.random() * (max - min)
const elegir = <T,>(lista: readonly T[]): T => lista[Math.floor(Math.random() * lista.length)]!

export class MotorConfeti {
  private particulas: Particula[] = []
  private ctx: CanvasRenderingContext2D | null
  private frame = 0
  private ultimo = 0
  private ancho = 0
  private alto = 0
  private dpr = 1

  constructor(private readonly lienzo: HTMLCanvasElement) {
    this.ctx = lienzo.getContext('2d')
  }

  get activo(): boolean {
    return this.frame !== 0
  }

  lanzar(): void {
    if (!this.ctx) return
    this.medir()
    const escala = Math.max(0.8, Math.min(1.35, this.alto / 800))
    this.canon(-20, this.alto * 0.92, -62, 95, escala)
    this.canon(this.ancho + 20, this.alto * 0.92, -118, 95, escala)
    for (let i = 0; i < 40; i++) {
      const p = this.crear(azar(0, this.ancho), azar(-120, -10), azar(-60, 60), azar(40, 180))
      this.agregar(p)
    }
    if (!this.frame) {
      this.ultimo = performance.now()
      this.frame = requestAnimationFrame(this.paso)
    }
  }

  /**
   * Ráfaga local desde un punto (un regalo que se abre): abanico hacia arriba,
   * más pequeña que la celebración de los cañones.
   */
  rafaga(x: number, y: number, { cantidad = 55, serpentinas = 5, fuerza = 1 }: { cantidad?: number; serpentinas?: number; fuerza?: number } = {}): void {
    if (!this.ctx) return
    this.medir()
    for (let i = 0; i < cantidad; i++) {
      const a = ((-90 + azar(-70, 70)) * Math.PI) / 180
      const v = azar(450, 1150) * fuerza
      this.agregar(this.crear(x + azar(-12, 12), y, Math.cos(a) * v, Math.sin(a) * v, i < serpentinas ? 'serpentina' : undefined))
    }
    if (!this.frame) {
      this.ultimo = performance.now()
      this.frame = requestAnimationFrame(this.paso)
    }
  }

  detener(): void {
    cancelAnimationFrame(this.frame)
    this.frame = 0
    this.particulas = []
    this.ctx?.clearRect(0, 0, this.lienzo.width, this.lienzo.height)
  }

  private medir() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.ancho = window.innerWidth
    this.alto = window.innerHeight
    const w = Math.round(this.ancho * this.dpr)
    const h = Math.round(this.alto * this.dpr)
    if (this.lienzo.width !== w || this.lienzo.height !== h) {
      this.lienzo.width = w
      this.lienzo.height = h
    }
  }

  private canon(x: number, y: number, anguloGrados: number, cantidad: number, escala: number) {
    for (let i = 0; i < cantidad; i++) {
      const a = ((anguloGrados + azar(-20, 20)) * Math.PI) / 180
      const v = azar(1100, 2300) * escala
      const p = this.crear(x, y, Math.cos(a) * v, Math.sin(a) * v, i < 7 ? 'serpentina' : undefined)
      this.agregar(p)
    }
  }

  private agregar(p: Particula) {
    this.particulas.push(p)
    if (this.particulas.length > MAX_PARTICULAS) this.particulas.splice(0, this.particulas.length - MAX_PARTICULAS)
  }

  private crear(x: number, y: number, vx: number, vy: number, forzada?: Forma): Particula {
    const forma: Forma = forzada ?? elegir<Forma>(['tira', 'tira', 'tira', 'cuadro', 'circulo', 'triangulo'])
    const base = azar(7, 15)
    return {
      x,
      y,
      vx,
      vy,
      rot: azar(0, Math.PI * 2),
      vrot: azar(-9, 9),
      giro: azar(0, Math.PI * 2),
      vgiro: azar(5, 13),
      ancho: forma === 'tira' ? base * 0.55 : forma === 'serpentina' ? azar(5, 7) : base,
      alto: forma === 'tira' ? base * 1.6 : base,
      color: elegir(COLORES),
      forma,
      borde: Math.random() < 0.35 || forma === 'serpentina',
      arrastre: forma === 'serpentina' ? azar(3.2, 4) : azar(2.4, 3.6),
      gravedad: forma === 'serpentina' ? 520 : azar(620, 820),
      fase: azar(0, Math.PI * 2),
      edad: 0,
      vida: azar(5, 7.5),
    }
  }

  private paso = (ahora: number) => {
    const ctx = this.ctx
    if (!ctx) return
    const dt = Math.min((ahora - this.ultimo) / 1000, 1 / 30)
    this.ultimo = ahora

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.lienzo.width, this.lienzo.height)

    {
      for (const p of this.particulas) {
        const freno = Math.exp(-p.arrastre * dt)
        p.vx *= freno
        p.vy = p.vy * freno + p.gravedad * dt
        p.x += (p.vx + Math.sin(p.edad * 3 + p.fase) * 40) * dt
        p.y += p.vy * dt
        p.rot += p.vrot * dt
        p.giro += p.vgiro * dt
        p.edad += dt
      }
      this.particulas = this.particulas.filter((p) => p.edad < p.vida && p.y < this.alto + 60)
    }

    for (const p of this.particulas) this.dibujar(ctx, p)

    if (this.particulas.length > 0) {
      this.frame = requestAnimationFrame(this.paso)
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, this.lienzo.width, this.lienzo.height)
      this.frame = 0
    }
  }

  private dibujar(ctx: CanvasRenderingContext2D, p: Particula) {
    const c = Math.cos(p.rot)
    const s = Math.sin(p.rot)
    const d = this.dpr
    // Desvanecer el último medio segundo de vida.
    const restante = p.vida - p.edad
    if (restante < 0.5) ctx.globalAlpha = Math.max(0, restante / 0.5)

    if (p.forma === 'serpentina') {
      ctx.setTransform(c * d, s * d, -s * d, c * d, p.x * d, p.y * d)
      const segmentos = 11
      const largo = 7
      ctx.beginPath()
      for (let i = 0; i <= segmentos; i++) {
        const lx = (i - segmentos / 2) * largo
        const ly = Math.sin(i * 0.9 + p.fase + p.edad * 7) * 7
        if (i === 0) ctx.moveTo(lx, ly)
        else ctx.lineTo(lx, ly)
      }
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = TINTA
      ctx.lineWidth = p.ancho + 3
      ctx.stroke()
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.ancho
      ctx.stroke()
    } else {
      // Rotación + volteo en Y (cos del giro) para simular papel que da vueltas.
      const sy = Math.cos(p.giro)
      ctx.setTransform(c * d, s * d, -s * sy * d, c * sy * d, p.x * d, p.y * d)
      ctx.beginPath()
      const w = p.ancho
      const h = p.alto
      if (p.forma === 'circulo') ctx.arc(0, 0, w / 2, 0, Math.PI * 2)
      else if (p.forma === 'triangulo') {
        ctx.moveTo(0, -h / 2)
        ctx.lineTo(w / 2, h / 2)
        ctx.lineTo(-w / 2, h / 2)
        ctx.closePath()
      } else ctx.rect(-w / 2, -h / 2, w, h)
      ctx.fillStyle = p.color
      ctx.fill()
      if (p.borde || p.color === '#FFF5E6') {
        ctx.lineWidth = 1.6
        ctx.strokeStyle = TINTA
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  }
}

/**
 * Resorte amortiguado (Euler semi-implícito con subpasos fijos).
 * Mueve las letras de ISA!: masa implícita 1, rigidez y amortiguación por letra.
 */
export interface Resorte {
  valor: number
  velocidad: number
  objetivo: number
}

export interface ParametrosResorte {
  rigidez: number
  amortiguacion: number
}

const SUBPASO = 1 / 120

export function crearResorte(valor = 0, objetivo = valor): Resorte {
  return { valor, velocidad: 0, objetivo }
}

export function avanzar(r: Resorte, p: ParametrosResorte, dt: number): void {
  // Un frame largo (pestaña recuperada) no debe lanzar las letras al infinito.
  let restante = Math.min(dt, 1 / 20)
  while (restante > 1e-6) {
    const h = Math.min(SUBPASO, restante)
    const fuerza = -p.rigidez * (r.valor - r.objetivo) - p.amortiguacion * r.velocidad
    r.velocidad += fuerza * h
    r.valor += r.velocidad * h
    restante -= h
  }
}

export function enReposo(r: Resorte, umbral = 0.05): boolean {
  return Math.abs(r.valor - r.objetivo) < umbral && Math.abs(r.velocidad) < umbral
}

/** Amortiguación crítica: llega sin rebotar. */
export function amortiguacionCritica(rigidez: number): number {
  return 2 * Math.sqrt(rigidez)
}

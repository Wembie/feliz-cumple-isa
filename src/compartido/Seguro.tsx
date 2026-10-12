import { Component, type ReactNode } from 'react'

interface Props {
  /** Alternativa sencilla si la sección falla. Nunca se deja un hueco vacío. */
  alternativa: ReactNode
  children: ReactNode
}

export class Seguro extends Component<Props, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('Una sección no pudo mostrarse; se usa la alternativa.', error)
  }

  render() {
    return this.state.fallo ? this.props.alternativa : this.props.children
  }
}

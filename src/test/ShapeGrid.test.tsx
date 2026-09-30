import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ShapeGrid } from '../components/ui/ShapeGrid'

/**
 * O `useReducedMotion` real le `window.matchMedia`, que o jsdom nao implementa
 * (o valor ficaria memoizado como `false` para o arquivo inteiro). O mock
 * preserva o resto do Framer Motion e deixa cada teste escolher a preferencia,
 * exercitando as duas ramificacoes da malha.
 */
const reducedMotion = vi.hoisted(() => ({ enabled: false }))

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()

  return { ...actual, useReducedMotion: () => reducedMotion.enabled }
})

/** Caixa logica da camada: entra no lugar do layout que o jsdom nao calcula. */
const CANVAS_BOX = { width: 560, height: 280 }

/** jsdom nao implementa ResizeObserver: a malha apenas observa e desconecta. */
class ResizeObserverStub implements ResizeObserver {
  static readonly instances: ResizeObserverStub[] = []

  constructor() {
    ResizeObserverStub.instances.push(this)
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

interface PaintedCell {
  fillStyle: string
  globalAlpha: number
}

/** Registro do quadro desenhado (o jsdom nao traz canvas 2D nativo). */
interface Recording {
  clears: Array<[number, number, number, number]>
  transforms: Array<[number, number, number, number, number, number]>
  cellBorders: number
  paintedCells: PaintedCell[]
}

const createRecordingContext = () => {
  const recording: Recording = { clears: [], transforms: [], cellBorders: 0, paintedCells: [] }

  const context = {
    globalAlpha: 1,
    fillStyle: '#000',
    strokeStyle: '#000',
    setTransform: (...values: [number, number, number, number, number, number]) => {
      recording.transforms.push(values)
    },
    clearRect: (...values: [number, number, number, number]) => {
      recording.clears.push(values)
    },
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    rect: () => {},
    arc: () => {},
    fill: () => {
      recording.paintedCells.push({
        fillStyle: String(context.fillStyle),
        globalAlpha: context.globalAlpha,
      })
    },
    stroke: () => {},
    strokeRect: () => {
      recording.cellBorders += 1
    },
  }

  return { context: context as unknown as CanvasRenderingContext2D, recording }
}

/** Troca o layout zerado do jsdom (0x0) pela caixa da camada. */
const stubCanvasLayout = () => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => CANVAS_BOX.width,
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => CANVAS_BOX.height,
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: CANVAS_BOX.width,
    bottom: CANVAS_BOX.height,
    width: CANVAS_BOX.width,
    height: CANVAS_BOX.height,
    toJSON: () => ({}),
  } as DOMRect)
}

const movePointerTo = (clientX: number, clientY: number) => {
  window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }))
}

/** Espera o realce parar de ser pintado por uma janela de tempo inteira. */
const waitForFadeToSettle = async (paintedCells: PaintedCell[]) => {
  await waitFor(
    async () => {
      const total = paintedCells.length
      await new Promise((resolve) => setTimeout(resolve, 160))
      expect(paintedCells.length).toBe(total)
    },
    { timeout: 3000 },
  )
}

/** Monta a malha com um contexto 2D de registro e devolve o que foi pintado. */
const drawGrid = (props: Parameters<typeof ShapeGrid>[0] = {}) => {
  const { context, recording } = createRecordingContext()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  stubCanvasLayout()

  const view = render(<ShapeGrid squareSize={56} {...props} />)

  return {
    ...view,
    recording,
    canvas: view.container.querySelector('canvas') as HTMLCanvasElement,
  }
}

beforeEach(() => {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
  // Sem canvas nativo o padrao e nao pintar nada (evita ruido do jsdom).
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

afterEach(() => {
  reducedMotion.enabled = false
  ResizeObserverStub.instances.length = 0
  Reflect.deleteProperty(HTMLCanvasElement.prototype, 'offsetWidth')
  Reflect.deleteProperty(HTMLCanvasElement.prototype, 'offsetHeight')
  // Devolve o stub de IntersectionObserver instalado em `setup.ts`.
  vi.unstubAllGlobals()
})

describe('ShapeGrid', () => {
  it('renderiza a malha como camada decorativa', () => {
    const { container } = render(<ShapeGrid className="extra" />)
    const canvas = container.querySelector('canvas')

    expect(canvas).toHaveClass('shapegrid-canvas')
    expect(canvas).toHaveClass('extra')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('nao pinta nem observa nada sem contexto 2D', () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    const { container } = render(<ShapeGrid />)

    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(getContext).toHaveBeenCalledWith('2d')
    expect(ResizeObserverStub.instances).toHaveLength(0)
  })

  it('desenha em px CSS com escala de DPR limitada a 2', async () => {
    vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(3)

    const { canvas, recording } = drawGrid()

    // MAX_DPR = 2: acima disso o custo de pintura nao se paga.
    expect(canvas.width).toBe(CANVAS_BOX.width * 2)
    expect(canvas.height).toBe(CANVAS_BOX.height * 2)
    expect(recording.transforms[0]).toEqual([2, 0, 0, 2, 0, 0])

    // O quadro e limpo e as celulas sao tracadas nas dimensoes logicas.
    await waitFor(() =>
      expect(recording.clears).toContainEqual([0, 0, CANVAS_BOX.width, CANVAS_BOX.height]),
    )
    await waitFor(() => expect(recording.cellBorders).toBeGreaterThanOrEqual(50))
  })

  it('nao desenha quadros enquanto a camada esta fora de cena', async () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
        takeRecords(): IntersectionObserverEntry[] {
          return []
        }
      },
    )

    const { recording } = drawGrid()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(recording.cellBorders).toBe(0)
  })

  it('nao desenha quadros com a aba em segundo plano', async () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)

    const { recording } = drawGrid()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(recording.cellBorders).toBe(0)
  })

  it('acende a celula sob o cursor e apaga quando o ponteiro deixa a area', async () => {
    const { recording } = drawGrid({ hoverFillColor: 'rgba(59, 118, 246, 0.22)' })

    movePointerTo(300, 150)

    await waitFor(() => expect(recording.paintedCells.length).toBeGreaterThan(0))
    expect(recording.paintedCells.at(-1)?.fillStyle).toBe('rgba(59, 118, 246, 0.22)')

    // Com o cursor parado o realce chega ao alpha cheio.
    await waitFor(
      () =>
        expect(Math.max(...recording.paintedCells.map((cell) => cell.globalAlpha))).toBeCloseTo(
          1,
          2,
        ),
      { timeout: 3000 },
    )

    // Fora da area o realce desbota ate a celula sair do mapa.
    movePointerTo(2000, 2000)
    await waitForFadeToSettle(recording.paintedCells)

    expect(recording.paintedCells.at(-1)?.globalAlpha).toBeLessThan(0.05)
  })

  it('mantem a trilha das ultimas celulas acesas com hoverTrailAmount', async () => {
    const { recording } = drawGrid({ hoverTrailAmount: 5 })

    movePointerTo(30, 30)
    movePointerTo(90, 30)
    movePointerTo(2000, 2000)

    // A trilha para em um alpha acima de zero, entao as celulas visitadas
    // continuam acesas — diferente do caso sem trilha, que zera e sai do mapa.
    await waitFor(() =>
      expect(
        Math.max(...recording.paintedCells.slice(-8).map((cell) => cell.globalAlpha)),
      ).toBeGreaterThan(0.2),
    )

    const settled = recording.paintedCells.length
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(recording.paintedCells.length).toBeGreaterThan(settled)
  })

  it('desenha um unico quadro quando o movimento e reduzido', async () => {
    reducedMotion.enabled = true

    const { recording } = drawGrid()

    // O quadro sai no proprio efeito, sem depender de requestAnimationFrame.
    expect(recording.clears).toContainEqual([0, 0, CANVAS_BOX.width, CANVAS_BOX.height])

    const borders = recording.cellBorders
    expect(borders).toBeGreaterThanOrEqual(50)

    // Sem loop de animacao e sem rastro de cursor.
    movePointerTo(300, 150)
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(recording.cellBorders).toBe(borders)
    expect(recording.paintedCells).toHaveLength(0)
  })

  it('para o loop quando a camada e desmontada', async () => {
    const { recording, unmount } = drawGrid()

    await waitFor(() => expect(recording.cellBorders).toBeGreaterThan(0))

    unmount()
    const borders = recording.cellBorders
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(recording.cellBorders).toBe(borders)
  })
})

import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

import './ShapeGrid.css'

type GridDirection = 'diagonal' | 'up' | 'right' | 'down' | 'left'
type GridShape = 'square' | 'hexagon' | 'circle' | 'triangle'

interface ShapeGridProps {
  /** Direcao do arrasto da malha. */
  direction?: GridDirection
  /** Multiplicador de velocidade do arrasto. */
  speed?: number
  /** Cor das bordas das celulas. */
  borderColor?: string
  /** Lado da celula em px — define tambem a densidade da malha. */
  squareSize?: number
  /** Cor de preenchimento da celula sob o cursor. */
  hoverFillColor?: string
  /** Geometria da celula. */
  shape?: GridShape
  /** Quantas celulas ja visitadas continuam acesas, em fade. 0 desliga. */
  hoverTrailAmount?: number
  className?: string
}

interface Cell {
  x: number
  y: number
}

/** Tamanho logico (px CSS) do palco: todo o desenho acontece nessa unidade. */
interface Viewport {
  width: number
  height: number
}

/** Teto do device pixel ratio: acima de 2 o custo de pintura nao se paga. */
const MAX_DPR = 2

/** Suavizacao do fade das celulas acesas, em fracao por frame. */
const OPACITY_EASE = 0.15
/** Abaixo disso a celula e considerada apagada e sai do mapa. */
const OPACITY_MIN = 0.005

/**
 * Malha animada em canvas (React Bits — ShapeGrid), adaptada para o projeto:
 *
 * - o desenho acontece em px CSS com escala de `devicePixelRatio`, para que as
 *   bordas de 1px nao fiquem borradas em telas densas;
 * - o rastreio do cursor e feito na janela e limitado a area da camada, porque a
 *   malha e usada atras do conteudo e nao pode capturar ponteiro;
 * - `prefers-reduced-motion` desenha um quadro estatico em vez de animar;
 * - o esmaecimento das bordas e responsabilidade do consumidor (aqui,
 *   `mask-fade-edges` no hero), evitando uma segunda camada de gradiente.
 */
export function ShapeGrid({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222',
  shape = 'square',
  hoverTrailAmount = 0,
  className = '',
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | null>(null)
  const gridOffset = useRef({ x: 0, y: 0 })
  const hoveredCell = useRef<Cell | null>(null)
  const trailCells = useRef<Cell[]>([])
  const cellOpacities = useRef(new Map<string, number>())
  const viewport = useRef<Viewport>({ width: 0, height: 0 })

  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = shouldReduceMotion === true

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    // jsdom (testes) e ambientes sem canvas 2D: a camada apenas nao pinta.
    if (!context) return

    const isHex = shape === 'hexagon'
    const isTri = shape === 'triangle'
    const hexHoriz = squareSize * 1.5
    const hexVert = squareSize * Math.sqrt(3)
    const halfWidth = squareSize / 2

    // Passo de repeticao da malha: permite reciclar o deslocamento em vez de
    // deixa-lo crescer sem limite.
    const wrapX = isHex ? hexHoriz * 2 : squareSize
    const wrapY = isHex ? hexVert : isTri ? squareSize * 2 : squareSize

    /** Modulo sempre positivo: o deslocamento visivel fica em [0, passo). */
    const modulo = (value: number, step: number) => ((value % step) + step) % step

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      viewport.current = { width, height }
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      // Redimensionar zera a matriz do contexto: reaplica a escala de DPR.
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawHexagon = (centerX: number, centerY: number, size: number) => {
      context.beginPath()
      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI / 3) * index
        const x = centerX + size * Math.cos(angle)
        const y = centerY + size * Math.sin(angle)
        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.closePath()
    }

    const drawCircle = (centerX: number, centerY: number, size: number) => {
      context.beginPath()
      context.arc(centerX, centerY, size / 2, 0, Math.PI * 2)
      context.closePath()
    }

    const drawTriangle = (centerX: number, centerY: number, size: number, flip: boolean) => {
      context.beginPath()
      if (flip) {
        context.moveTo(centerX, centerY + size / 2)
        context.lineTo(centerX + size / 2, centerY - size / 2)
        context.lineTo(centerX - size / 2, centerY - size / 2)
      } else {
        context.moveTo(centerX, centerY - size / 2)
        context.lineTo(centerX + size / 2, centerY + size / 2)
        context.lineTo(centerX - size / 2, centerY + size / 2)
      }
      context.closePath()
    }

    const drawSquare = (x: number, y: number) => {
      context.beginPath()
      context.rect(x, y, squareSize, squareSize)
    }

    /** Pinta a celula acesa, com a opacidade corrente do fade. */
    const paintCell = (cellKey: string, trace: () => void) => {
      const alpha = cellOpacities.current.get(cellKey)
      if (!alpha) return

      context.globalAlpha = alpha
      trace()
      context.fillStyle = hoverFillColor
      context.fill()
      context.globalAlpha = 1
    }

    const drawGrid = () => {
      const { width, height } = viewport.current
      context.clearRect(0, 0, width, height)

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz)
        const offsetX = modulo(gridOffset.current.x, hexHoriz)
        const offsetY = modulo(gridOffset.current.y, hexVert)
        const cols = Math.ceil(width / hexHoriz) + 3
        const rows = Math.ceil(height / hexVert) + 3

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const centerX = col * hexHoriz + offsetX
            const centerY = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY
            const cellKey = `${col},${row}`

            paintCell(cellKey, () => drawHexagon(centerX, centerY, squareSize))

            drawHexagon(centerX, centerY, squareSize)
            context.strokeStyle = borderColor
            context.stroke()
          }
        }

        return
      }

      if (isTri) {
        const colShift = Math.floor(gridOffset.current.x / halfWidth)
        const rowShift = Math.floor(gridOffset.current.y / squareSize)
        const offsetX = modulo(gridOffset.current.x, halfWidth)
        const offsetY = modulo(gridOffset.current.y, squareSize)
        const cols = Math.ceil(width / halfWidth) + 4
        const rows = Math.ceil(height / squareSize) + 4

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const centerX = col * halfWidth + offsetX
            const centerY = row * squareSize + squareSize / 2 + offsetY
            const flip = modulo(col + colShift + row + rowShift, 2) !== 0
            const cellKey = `${col},${row}`

            paintCell(cellKey, () => drawTriangle(centerX, centerY, squareSize, flip))

            drawTriangle(centerX, centerY, squareSize, flip)
            context.strokeStyle = borderColor
            context.stroke()
          }
        }

        return
      }

      const offsetX = modulo(gridOffset.current.x, squareSize)
      const offsetY = modulo(gridOffset.current.y, squareSize)
      const cols = Math.ceil(width / squareSize) + 3
      const rows = Math.ceil(height / squareSize) + 3
      const isRound = shape === 'circle'

      for (let col = -2; col < cols; col += 1) {
        for (let row = -2; row < rows; row += 1) {
          // Circulos ficam no centro da celula; quadrados, no canto.
          const centerX = col * squareSize + offsetX + (isRound ? squareSize / 2 : 0)
          const centerY = row * squareSize + offsetY + (isRound ? squareSize / 2 : 0)
          const cellKey = `${col},${row}`

          if (isRound) {
            paintCell(cellKey, () => drawCircle(centerX, centerY, squareSize))

            drawCircle(centerX, centerY, squareSize)
            context.strokeStyle = borderColor
            context.stroke()
            continue
          }

          const x = col * squareSize + offsetX
          const y = row * squareSize + offsetY

          paintCell(cellKey, () => drawSquare(x, y))

          context.strokeStyle = borderColor
          context.strokeRect(x, y, squareSize, squareSize)
        }
      }
    }

    const updateCellOpacities = () => {
      const targets = new Map<string, number>()

      if (hoveredCell.current) {
        targets.set(`${hoveredCell.current.x},${hoveredCell.current.y}`, 1)
      }

      if (hoverTrailAmount > 0) {
        for (let index = 0; index < trailCells.current.length; index += 1) {
          const cell = trailCells.current[index]
          const cellKey = `${cell.x},${cell.y}`
          if (!targets.has(cellKey)) {
            targets.set(
              cellKey,
              (trailCells.current.length - index) / (trailCells.current.length + 1),
            )
          }
        }
      }

      for (const cellKey of targets.keys()) {
        if (!cellOpacities.current.has(cellKey)) cellOpacities.current.set(cellKey, 0)
      }

      for (const [cellKey, opacity] of cellOpacities.current) {
        const target = targets.get(cellKey) || 0
        const next = opacity + (target - opacity) * OPACITY_EASE

        if (next < OPACITY_MIN) cellOpacities.current.delete(cellKey)
        else cellOpacities.current.set(cellKey, next)
      }
    }

    /** Celula sob o cursor, na mesma geometria usada pelo desenho. */
    const cellFromPointer = (mouseX: number, mouseY: number): Cell => {
      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHoriz)
        const offsetX = modulo(gridOffset.current.x, hexHoriz)
        const offsetY = modulo(gridOffset.current.y, hexVert)
        const col = Math.round((mouseX - offsetX) / hexHoriz)
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0

        return { x: col, y: Math.round((mouseY - offsetY - rowOffset) / hexVert) }
      }

      if (isTri) {
        const offsetX = modulo(gridOffset.current.x, halfWidth)
        const offsetY = modulo(gridOffset.current.y, squareSize)

        return {
          x: Math.round((mouseX - offsetX) / halfWidth),
          y: Math.floor((mouseY - offsetY) / squareSize),
        }
      }

      const offsetX = modulo(gridOffset.current.x, squareSize)
      const offsetY = modulo(gridOffset.current.y, squareSize)

      if (shape === 'circle') {
        return {
          x: Math.round((mouseX - offsetX) / squareSize),
          y: Math.round((mouseY - offsetY) / squareSize),
        }
      }

      return {
        x: Math.floor((mouseX - offsetX) / squareSize),
        y: Math.floor((mouseY - offsetY) / squareSize),
      }
    }

    /** Empurra a celula para a trilha do fade, respeitando o limite configurado. */
    const pushTrail = (cell: Cell) => {
      if (hoverTrailAmount <= 0) return

      trailCells.current.unshift({ ...cell })
      if (trailCells.current.length > hoverTrailAmount) {
        trailCells.current.length = hoverTrailAmount
      }
    }

    const setHoveredCell = (cell: Cell | null) => {
      const current = hoveredCell.current
      if (current && cell && current.x === cell.x && current.y === cell.y) return

      if (current) pushTrail(current)
      hoveredCell.current = cell
    }

    const handlePointerMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // O rastreio vem da janela (a camada fica atras do conteudo e sob
      // `pointer-events: none`), entao o que cai fora da area nao acende nada.
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setHoveredCell(null)
        return
      }

      setHoveredCell(cellFromPointer(x, y))
    }

    const handlePointerLeave = () => setHoveredCell(null)

    const advanceGrid = () => {
      const effectiveSpeed = Math.max(speed, 0.1)

      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX
          break
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + wrapX) % wrapX
          break
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + wrapY) % wrapY
          break
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY
          break
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + wrapX) % wrapX
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + wrapY) % wrapY
          break
        default:
          break
      }
    }

    const drawFrame = () => {
      updateCellOpacities()
      drawGrid()
    }

    resizeCanvas()

    // Movimento reduzido: a malha continua no fundo, mas como textura estatica.
    if (reduceMotion) {
      drawFrame()

      const staticObserver = new ResizeObserver(() => {
        resizeCanvas()
        drawFrame()
      })
      staticObserver.observe(canvas)

      return () => staticObserver.disconnect()
    }

    let isVisible = false
    let isPageVisible = !document.hidden

    const loop = () => {
      advanceGrid()
      drawFrame()
      frameRef.current = window.requestAnimationFrame(loop)
    }

    const tryStart = () => {
      if (isVisible && isPageVisible && frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(loop)
      }
    }

    const tryStop = () => {
      if (frameRef.current === null) return

      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    // Fora de cena ou com a aba em segundo plano nenhum quadro e desenhado.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) tryStart()
        else tryStop()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(canvas)

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden
      if (isPageVisible) tryStart()
      else tryStop()
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
      if (!isVisible) drawFrame()
    })
    resizeObserver.observe(canvas)

    window.addEventListener('mousemove', handlePointerMove)
    document.addEventListener('mouseleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    tryStart()

    return () => {
      tryStop()
      window.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [
    borderColor,
    direction,
    hoverFillColor,
    hoverTrailAmount,
    reduceMotion,
    shape,
    speed,
    squareSize,
  ])

  return <canvas ref={canvasRef} aria-hidden="true" className={`shapegrid-canvas ${className}`} />
}

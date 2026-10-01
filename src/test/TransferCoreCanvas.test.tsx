import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TransferCoreCanvas } from '../components/sections/TransferCoreCanvas'
import { heroSectionRef } from '../lib/heroAnchor'

/**
 * O canvas do cubo exige WebGL, que o jsdom nao tem: o R3F entra como duble que
 * guarda o callback do `useFrame`, e o giro do cubo e exercido quadro a quadro.
 *
 * O que esta sob teste e a origem do ponteiro — a secao do hero, e nao a caixa
 * do canvas —, que e o que faz o cubo girar tambem quando o visitante passa o
 * mouse sobre o texto da esquerda.
 */
const r3f = vi.hoisted(() => ({ frame: null as (() => void) | null }))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useFrame: (callback: () => void) => {
    r3f.frame = callback
  },
}))

const reducedMotion = vi.hoisted(() => ({ enabled: false }))

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()

  return { ...actual, useReducedMotion: () => reducedMotion.enabled }
})

/** Pose de repouso e ganho do ponteiro, espelhando o componente. */
const REST = { x: 0.45, y: -0.55 }
const POINTER_TILT = 0.13

/** Caixa logica do hero: entra no lugar do layout que o jsdom nao calcula. */
const HERO_BOX = { width: 1200, height: 800 }

/**
 * No jsdom o `<group>` do R3F vira um elemento comum do DOM, e precisa da
 * propriedade `rotation` que o `useFrame` escreve a cada quadro.
 */
const rotation = { x: 0, y: 0 }

Object.defineProperty(Element.prototype, 'rotation', {
  configurable: true,
  writable: true,
  value: rotation,
})

/** Monta o hero real (secao com o texto dentro) e aponta a ancora para ele. */
function mountHero() {
  const hero = document.createElement('section')
  const title = document.createElement('h1')
  hero.append(title)
  document.body.append(hero)

  vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: HERO_BOX.width,
    bottom: HERO_BOX.height,
    width: HERO_BOX.width,
    height: HERO_BOX.height,
    toJSON: () => ({}),
  } as DOMRect)

  heroSectionRef.current = hero

  return { hero, title }
}

/** Roda o `useFrame` ate o `lerp` convergir para o alvo. */
const settle = (frames = 400) => {
  for (let frame = 0; frame < frames; frame += 1) r3f.frame?.()
}

/** O ponteiro chega por um filho (o texto) e sobe por borbulhamento. */
const movePointerTo = (target: Element, clientX: number, clientY: number) => {
  target.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY, bubbles: true }))
}

const logError = console.error.bind(console)

beforeEach(() => {
  rotation.x = 0
  rotation.y = 0
  r3f.frame = null
  reducedMotion.enabled = false

  // O duble desenha os primitivos do three como elementos HTML desconhecidos e o
  // React avisa de cada um em todo render: e ruido do duble, nao do componente.
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('is using incorrect casing')) return

    logError(...args)
  })
})

afterEach(() => {
  heroSectionRef.current = null
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

function installOrientationPermission(permission: 'granted' | 'denied' = 'granted') {
  class MockDeviceOrientationEvent {}
  const requestPermission = vi.fn().mockResolvedValue(permission)
  Object.assign(MockDeviceOrientationEvent, { requestPermission })
  vi.stubGlobal('DeviceOrientationEvent', MockDeviceOrientationEvent)

  return requestPermission
}

function dispatchOrientation(beta: number, gamma: number) {
  window.dispatchEvent(Object.assign(new Event('deviceorientation'), { beta, gamma }))
}

describe('TransferCoreCanvas', () => {
  it('gira o cubo com o ponteiro sobre a coluna de texto, fora do canvas', () => {
    const { title } = mountHero()
    render(<TransferCoreCanvas />)

    // 5% da largura do hero: sobre o texto, onde antes nada acontecia.
    movePointerTo(title, 60, 400)
    settle()

    // nx = -0.9 e ny = 0
    expect(rotation.y).toBeCloseTo(REST.y - 0.9 * POINTER_TILT, 3)
    expect(rotation.x).toBeCloseTo(REST.x, 3)
  })

  it('acompanha o ponteiro na largura inteira do hero', () => {
    const { title } = mountHero()
    render(<TransferCoreCanvas />)

    movePointerTo(title, 60, 400)
    settle()
    const left = rotation.y

    movePointerTo(title, 1140, 400)
    settle()
    const right = rotation.y

    // nx = -0.9 e +0.9: o cubo tem que assumir as duas pontas.
    expect(left).toBeCloseTo(REST.y - 0.9 * POINTER_TILT, 3)
    expect(right).toBeCloseTo(REST.y + 0.9 * POINTER_TILT, 3)
    // Distancia entre as duas pontas: 1.8 (de -0.9 a +0.9) vezes o ganho.
    expect(Math.abs(right - left)).toBeCloseTo(1.8 * POINTER_TILT, 3)
  })

  it('usa a altura da secao no eixo Y, de cima para baixo', () => {
    const { title } = mountHero()
    render(<TransferCoreCanvas />)

    movePointerTo(title, 600, 0)
    settle()
    expect(rotation.x).toBeCloseTo(REST.x - POINTER_TILT, 3)

    movePointerTo(title, 600, 800)
    settle()
    expect(rotation.x).toBeCloseTo(REST.x + POINTER_TILT, 3)
  })

  it('calibra e acompanha a inclinacao do dispositivo', () => {
    vi.stubGlobal('DeviceOrientationEvent', class MockDeviceOrientationEvent {})
    render(<TransferCoreCanvas />)

    dispatchOrientation(90, 0)
    dispatchOrientation(120, 30)
    settle()

    expect(rotation.x).toBeCloseTo(REST.x - 0.2, 3)
    expect(rotation.y).toBeCloseTo(REST.y + 0.2, 3)
  })

  it('solicita permissao do sensor em navegadores que a exigem', async () => {
    const user = userEvent.setup()
    const requestPermission = installOrientationPermission()
    render(<TransferCoreCanvas />)

    await user.click(screen.getByRole('button', { name: /ativar movimento|enable motion/i }))

    expect(requestPermission).toHaveBeenCalledOnce()
    dispatchOrientation(90, 0)
    dispatchOrientation(120, 30)
    settle()

    expect(rotation.x).toBeCloseTo(REST.x - 0.2, 3)
    expect(rotation.y).toBeCloseTo(REST.y + 0.2, 3)
  })

  it('volta a pose de repouso quando o ponteiro sai do hero', () => {
    const { hero, title } = mountHero()
    render(<TransferCoreCanvas />)

    movePointerTo(title, 1140, 800)
    settle()
    expect(rotation.y).not.toBeCloseTo(REST.y, 2)

    hero.dispatchEvent(new MouseEvent('pointerleave'))
    settle()

    expect(rotation.x).toBeCloseTo(REST.x, 3)
    expect(rotation.y).toBeCloseTo(REST.y, 3)
  })

  it('ignora o ponteiro com movimento reduzido', () => {
    reducedMotion.enabled = true

    const { title } = mountHero()
    render(<TransferCoreCanvas />)

    movePointerTo(title, 1140, 800)
    settle()

    expect(rotation.x).toBeCloseTo(REST.x, 3)
    expect(rotation.y).toBeCloseTo(REST.y, 3)
  })

  it('remove os listeners ao desmontar', () => {
    const { hero } = mountHero()
    const removeListener = vi.spyOn(hero, 'removeEventListener')

    const { unmount } = render(<TransferCoreCanvas />)
    unmount()

    expect(removeListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(removeListener).toHaveBeenCalledWith('pointerleave', expect.any(Function))
  })

  it('remove o listener de orientacao ao desmontar', () => {
    vi.stubGlobal('DeviceOrientationEvent', class MockDeviceOrientationEvent {})
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<TransferCoreCanvas />)

    unmount()

    expect(removeListener).toHaveBeenCalledWith('deviceorientation', expect.any(Function))
  })
})

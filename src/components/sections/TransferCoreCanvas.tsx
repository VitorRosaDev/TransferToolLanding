import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { MathUtils, type Group } from 'three'

import { heroSectionRef } from '../../lib/heroAnchor'
import { IconSmartphone } from '../ui/icons'

type Vec3 = [number, number, number]

/** Peca do cubo: onde ela fica e como ela gira. */
interface CubePart {
  position: Vec3
  rotation: Vec3
}

/** Aresta do cubo. A metade posiciona cada barra e cada quina. */
const EDGE = 2.5
const HALF = EDGE / 2

/** Raio das barras: a grossura da "chapa" do cubo vazado. */
const THICKNESS = 0.16

/** Azul institucional do logo — o unico acento cromatico da secao. */
const CUBE_COLOR = '#3b76f6'

/**
 * Material: quase todo difuso, com um brilho especular curto.
 *
 * Metal alto (0.8+) sem environment map deixaria a peca quase preta, porque so
 * restaria o reflexo das luzes diretas — o cubo sumiria no fundo escuro do hero.
 */
const METALNESS = 0
const ROUGHNESS = 0.1

/** Luz propria: impede que as arestas apaguem de todo contra o fundo escuro. */
const EMISSIVE_INTENSITY = 0.1

/** Repouso em tres quartos: de frente o cubo pareceria uma chapa chapada. */
const REST_TILT: Vec3 = [0.45, -0.55, 0]

/** O quanto o ponteiro inclina o cubo (0 = ignora o mouse, 1 = acompanha tudo). */
const POINTER_TILT = 0.13

/** O giroscopio tem um ganho maior, mas continua limitado para nao distrair. */
const ORIENTATION_TILT = 0.2

/** Inclinacao relativa necessaria para atingir o limite do giro. */
const ORIENTATION_RANGE = 30

/** Fator do `lerp` por quadro: quanto menor, mais lento e mais suave o giro. */
const SMOOTHING = 0.05

/**
 * As 12 arestas de um cubo de aresta `EDGE`. Cada uma vira um cilindro do
 * comprimento do cubo: o eixo Y, no qual o cilindro nasce, e girado para o eixo
 * da aresta.
 */
const EDGES: readonly CubePart[] = [
  // Arestas verticais (eixo Y): o cilindro ja nasce alinhado a elas.
  { position: [HALF, 0, HALF], rotation: [0, 0, 0] },
  { position: [-HALF, 0, HALF], rotation: [0, 0, 0] },
  { position: [HALF, 0, -HALF], rotation: [0, 0, 0] },
  { position: [-HALF, 0, -HALF], rotation: [0, 0, 0] },

  // Arestas horizontais (eixo X): 90 graus em Z.
  { position: [0, HALF, HALF], rotation: [0, 0, Math.PI / 2] },
  { position: [0, -HALF, HALF], rotation: [0, 0, Math.PI / 2] },
  { position: [0, HALF, -HALF], rotation: [0, 0, Math.PI / 2] },
  { position: [0, -HALF, -HALF], rotation: [0, 0, Math.PI / 2] },

  // Arestas de profundidade (eixo Z): 90 graus em X.
  { position: [HALF, HALF, 0], rotation: [Math.PI / 2, 0, 0] },
  { position: [-HALF, HALF, 0], rotation: [Math.PI / 2, 0, 0] },
  { position: [HALF, -HALF, 0], rotation: [Math.PI / 2, 0, 0] },
  { position: [-HALF, -HALF, 0], rotation: [Math.PI / 2, 0, 0] },
]

/** As 8 quinas: esferas do tamanho da grossura fecham as emendas das barras. */
const VERTICES: readonly Vec3[] = [
  [HALF, HALF, HALF],
  [-HALF, HALF, HALF],
  [HALF, -HALF, HALF],
  [-HALF, -HALF, HALF],
  [HALF, HALF, -HALF],
  [-HALF, HALF, -HALF],
  [HALF, -HALF, -HALF],
  [-HALF, -HALF, -HALF],
]

/**
 * Material unico das barras e das quinas: mesma cor, mesmo acabamento e mesma
 * luz propria, para que as 20 pecas leiam como um so cubo.
 */
function CubeMaterial() {
  return (
    <meshStandardMaterial
      color={CUBE_COLOR}
      emissive={CUBE_COLOR}
      emissiveIntensity={EMISSIVE_INTENSITY}
      metalness={METALNESS}
      roughness={ROUGHNESS}
    />
  )
}

/** Ponteiro normalizado (-1 a 1) nos dois eixos, medido sobre o hero. */
interface PointerOffset {
  x: number
  y: number
}

interface RotationInput extends PointerOffset {
  active: boolean
}

interface OrientationPermissionAPI {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

function getOrientationPermissionAPI(): OrientationPermissionAPI | null {
  if (typeof DeviceOrientationEvent === 'undefined') return null
  return DeviceOrientationEvent as typeof DeviceOrientationEvent & OrientationPermissionAPI
}

function updateOrientation(
  event: DeviceOrientationEvent,
  orientation: RotationInput,
  baseline: { current: { beta: number; gamma: number } | null },
) {
  if (event.beta === null || event.gamma === null) return

  if (!baseline.current) {
    baseline.current = { beta: event.beta, gamma: event.gamma }
    orientation.x = 0
    orientation.y = 0
    orientation.active = true
    return
  }

  orientation.x = MathUtils.clamp((event.gamma - baseline.current.gamma) / ORIENTATION_RANGE, -1, 1)
  orientation.y = MathUtils.clamp((event.beta - baseline.current.beta) / ORIENTATION_RANGE, -1, 1)
  orientation.active = true
}

function useDeviceOrientation(still: boolean) {
  const orientation = useRef<RotationInput>({ x: 0, y: 0, active: false })
  const baseline = useRef<{ beta: number; gamma: number } | null>(null)
  const listener = useRef<((event: DeviceOrientationEvent) => void) | null>(null)
  const permissionAPI = getOrientationPermissionAPI()
  const [permissionPrompt, setPermissionPrompt] = useState(
    () => !still && typeof permissionAPI?.requestPermission === 'function',
  )

  useEffect(() => {
    if (still || !permissionAPI || typeof permissionAPI.requestPermission === 'function') return

    baseline.current = null
    const handleOrientation = (event: DeviceOrientationEvent) =>
      updateOrientation(event, orientation.current, baseline)
    listener.current = handleOrientation
    window.addEventListener('deviceorientation', handleOrientation)

    return () => {
      if (listener.current) {
        window.removeEventListener('deviceorientation', listener.current)
        listener.current = null
      }
      orientation.current = { x: 0, y: 0, active: false }
      baseline.current = null
    }
  }, [permissionAPI, still])

  const requestPermission = async () => {
    if (!permissionAPI?.requestPermission || listener.current) return
    try {
      const permission = await permissionAPI.requestPermission()
      if (permission === 'granted') {
        baseline.current = null
        const handleOrientation = (event: DeviceOrientationEvent) =>
          updateOrientation(event, orientation.current, baseline)
        listener.current = handleOrientation
        window.addEventListener('deviceorientation', handleOrientation)
      }
    } catch {
      orientation.current.active = false
    } finally {
      setPermissionPrompt(false)
    }
  }

  return { orientation, permissionPrompt, requestPermission }
}

/**
 * Posicao do ponteiro relativa ao hero inteiro, de -1 a 1 nos dois eixos.
 *
 * O `state.pointer` do R3F e normalizado pela caixa do proprio canvas — aqui
 * isso seria so a coluna da direita —, entao o cubo reagiria apenas enquanto o
 * ponteiro estivesse sobre ela. Medindo o retangulo da secao, o cubo responde a
 * largura toda do hero, inclusive com o ponteiro sobre o texto, e volta a pose
 * de repouso quando o visitante sai da secao.
 */
function usePointerInHero() {
  const pointer = useRef<PointerOffset>({ x: 0, y: 0 })

  useEffect(() => {
    const hero = heroSectionRef.current
    if (!hero) return

    const handlePointerMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const handlePointerLeave = () => {
      pointer.current.x = 0
      pointer.current.y = 0
    }

    hero.addEventListener('pointermove', handlePointerMove)
    hero.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      hero.removeEventListener('pointermove', handlePointerMove)
      hero.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return pointer
}

/**
 * Cubo vazado azul: 12 cilindros nas arestas e 8 esferas nas quinas.
 *
 * O giro persegue o ponteiro com interpolacao, entao o cubo acompanha o mouse
 * sem saltar. Com `prefers-reduced-motion` o alvo volta a ser a pose de repouso
 * e o palco passa a desenhar sob demanda, sem laco de animacao.
 */
function HollowCube({
  still,
  pointer,
  orientation,
}: {
  still: boolean
  pointer: RefObject<PointerOffset>
  orientation: RefObject<RotationInput>
}) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const input = orientation.current.active ? orientation.current : pointer.current
    const tilt = orientation.current.active ? ORIENTATION_TILT : POINTER_TILT

    // O ponteiro vai de -1 a 1 nos dois eixos; a soma tem o sinal de Y invertido
    // para o cubo virar como se o visitante o empurrasse.
    const targetX = REST_TILT[0] - (still ? 0 : input.y * tilt)
    const targetY = REST_TILT[1] + (still ? 0 : input.x * tilt)

    group.rotation.x = MathUtils.lerp(group.rotation.x, targetX, SMOOTHING)
    group.rotation.y = MathUtils.lerp(group.rotation.y, targetY, SMOOTHING)
  })

  return (
    <group ref={groupRef} rotation={REST_TILT}>
      {EDGES.map((edge, index) => (
        <mesh key={`edge-${index}`} position={edge.position} rotation={edge.rotation}>
          {/* Cilindro: raio superior, raio inferior, altura, segmentos radiais. */}
          <cylinderGeometry args={[THICKNESS, THICKNESS, EDGE, 16]} />
          <CubeMaterial />
        </mesh>
      ))}

      {VERTICES.map((position, index) => (
        <mesh key={`vertex-${index}`} position={position}>
          <sphereGeometry args={[THICKNESS, 16, 16]} />
          <CubeMaterial />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Nucleo do TransferTool na dobra inicial: um cubo vazado azul — a carga
 * atravessando o sistema — que gira conforme o ponteiro passa por cima dele.
 *
 * Renderizado com React Three Fiber sobre o `three`: iluminacao e material de
 * verdade, ao custo de carregar a biblioteca 3D no bundle.
 */
export function TransferCoreCanvas({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const still = shouldReduceMotion ?? false
  const pointer = usePointerInHero()
  const { orientation, permissionPrompt, requestPermission } = useDeviceOrientation(still)

  return (
    <div className={className}>
      <Canvas
        aria-hidden="true"
        className="h-full w-full"
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        frameloop={still ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        {/* Luz + contra-luz: sem elas o cubo vira uma silhueta chapada. */}
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -2]} intensity={1} />
        <pointLight position={[0, 0, 2]} intensity={0.5} />

        <HollowCube still={still} pointer={pointer} orientation={orientation} />
      </Canvas>

      {permissionPrompt ? (
        <button
          type="button"
          onClick={() => void requestPermission()}
          className="absolute inset-x-0 bottom-2 z-10 mx-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/20 bg-void-900/80 px-4 text-xs font-medium text-white shadow-sm backdrop-blur transition-colors hover:bg-void-800 lg:hidden"
        >
          <IconSmartphone aria-hidden="true" className="h-4 w-4" />
          {t('hero.motion.enable')}
        </button>
      ) : null}
    </div>
  )
}

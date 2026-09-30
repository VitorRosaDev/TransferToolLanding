import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, type RefObject } from 'react'
import { MathUtils, type Group } from 'three'

import { heroSectionRef } from '../../lib/heroAnchor'

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
function HollowCube({ still, pointer }: { still: boolean; pointer: RefObject<PointerOffset> }) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const { x, y } = pointer.current

    // O ponteiro vai de -1 a 1 nos dois eixos; a soma tem o sinal de Y invertido
    // para o cubo virar como se o visitante o empurrasse.
    const targetX = REST_TILT[0] - (still ? 0 : y * POINTER_TILT)
    const targetY = REST_TILT[1] + (still ? 0 : x * POINTER_TILT)

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
  const shouldReduceMotion = useReducedMotion()
  const still = shouldReduceMotion ?? false
  const pointer = usePointerInHero()

  return (
    <Canvas
      aria-hidden="true"
      className={className}
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

      <HollowCube still={still} pointer={pointer} />
    </Canvas>
  )
}

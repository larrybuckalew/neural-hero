import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { buildNetwork, pointer, scrollProgress, type Neuron } from "../lib/neural"

// Sized so the whole orb sits comfortably in frame at every scroll depth.
// Too large and the camera ends up inside the mesh, which reads as a giant
// wire web rather than a brain.
const NODE_COUNT = 200
const RADIUS = 1.45
const NEIGHBORS = 4

/**
 * The "brain": a fibonacci-sphere neuron mesh wired to its nearest neighbours.
 *
 * Two continuous drivers:
 *  - pointer: neurons near the cursor push outward and brighten, so the shell
 *    leans toward the visitor.
 *  - scroll: the shell breathes wider and pulses harder as you descend, so the
 *    services section visibly wakes it up.
 */
export default function Brain() {
  const group = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Points>(null)
  const threads = useRef<THREE.LineSegments>(null)

  const net = useMemo(
    () => buildNetwork({ count: NODE_COUNT, radius: RADIUS, neighbors: NEIGHBORS }),
    [],
  )
  const neurons = net.neurons

  /**
   * Wiring every node to its neighbours gives ~430 edges, which reads as an
   * all-over wireframe web rather than a brain. Keeping roughly a fifth gives
   * the connected look without burying the glowing nodes.
   */
  const synapses = useMemo(
    () => net.synapses.filter((_, i) => i % 5 === 0),
    [net],
  )

  // Flat typed arrays keep the per-frame work allocation-free.
  // `restPositions` stays pristine; `livePositions` is the buffer the geometry
  // actually owns, mutated in place each frame.
  const restPositions = useMemo(
    () => new Float32Array(neurons.flatMap((n) => n.home.toArray())),
    [neurons],
  )
  const livePositions = useMemo(
    () => new Float32Array(restPositions),
    [restPositions],
  )
  const colors = useMemo(
    () => new Float32Array(neurons.length * 3).fill(0.6),
    [neurons],
  )

  const liveThreads = useMemo(() => {
    const arr = new Float32Array(synapses.length * 6)
    synapses.forEach((s, i) => {
      const a = neurons[s.from].home
      const b = neurons[s.to].home
      arr.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6)
    })
    return arr
  }, [synapses, neurons])

  // Reused every frame so the animation loop never allocates.
  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const scroll = scrollProgress.current
    const { x: px, y: py } = pointer

    // Scroll inflates the shell and raises its excitation â€” "waking up".
    const breath = 1 + Math.sin(t * 1.1) * 0.03 + scroll * 0.16
    const excite = 0.35 + scroll * 0.65

    if (group.current) {
      group.current.scale.setScalar(breath)
      group.current.rotation.y = t * 0.075 + px * 0.42
      group.current.rotation.x = Math.sin(t * 0.28) * 0.09 - py * 0.3
    }

// --- neurons ---------------------------------------------------------
    for (let i = 0; i < neurons.length; i++) {
      const n: Neuron = neurons[i]
      const i3 = i * 3

      scratch.set(restPositions[i3], restPositions[i3 + 1], restPositions[i3 + 2])

      // Cursor influence point, pushed out toward the shell's depth so it feels
      // like the pointer is touching the surface, not the screen.
      const cx = px * RADIUS * 1.6
      const cy = py * RADIUS * 1.6
      const dx = scratch.x - cx
      const dy = scratch.y - cy
      const dist = Math.hypot(dx, dy)

      // Quadratic falloff: strong at the cursor, gone by ~2.2 units out.
      const pull = Math.max(0, 1 - dist / 2.2)
      const ease = pull * pull

      // Each neuron fires on its own offset so pulses never sync up.
      const fire = (Math.sin(t * 2.6 + n.phase) * 0.5 + 0.5) * excite

      const push = 0.16 * excite * fire + ease * 0.85
      scratch.addScaledVector(n.normal, push)
      scratch.x -= dx * ease * 0.09
      scratch.y -= dy * ease * 0.09

      livePositions[i3] = scratch.x
      livePositions[i3 + 1] = scratch.y
      livePositions[i3 + 2] = scratch.z

      // Reacting neurons brighten, so the mesh reads as alive.
      const glow = 0.85 + fire * 0.7 + ease * 0.9
      colors[i3] = Math.min(1, glow * 0.34)
      colors[i3 + 1] = Math.min(1, glow * 0.72)
      colors[i3 + 2] = Math.min(1, glow)
    }

    if (shell.current) {
      // The geometry was built over `livePositions`, which we mutate in place
      // above, so there is nothing to copy here — just flag it for re-upload.
      // Copying into the attribute instead would alias back onto restPositions
      // and compound the push every frame, inflating the orb without bound.
      const pos = shell.current.geometry.getAttribute("position") as THREE.BufferAttribute
      pos.needsUpdate = true

      const col = shell.current.geometry.getAttribute("color") as THREE.BufferAttribute
      col.needsUpdate = true
    }

    // --- threads ---------------------------------------------------------
    // Both endpoints of a thread read from the already-updated neuron array,
    // so threads follow their neurons with no extra maths.
    for (let i = 0; i < synapses.length; i++) {
      const s = synapses[i]
      const o = i * 6
      const a3 = s.from * 3
      const b3 = s.to * 3

      liveThreads[o] = livePositions[a3]
      liveThreads[o + 1] = livePositions[a3 + 1]
      liveThreads[o + 2] = livePositions[a3 + 2]
      liveThreads[o + 3] = livePositions[b3]
      liveThreads[o + 4] = livePositions[b3 + 1]
      liveThreads[o + 5] = livePositions[b3 + 2]
    }

    if (threads.current) {
      const attr = threads.current.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute
      attr.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      <points ref={shell}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[livePositions, 3]}
            usage={THREE.DynamicDrawUsage}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.13}
          sizeAttenuation
          transparent
          opacity={1}
          depthWrite={false}
          fog={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={threads}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[liveThreads, 3]}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#4f8cff"
          transparent
          opacity={0.28}
          depthWrite={false}
          fog={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}

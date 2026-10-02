import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { mulberry32, pointer } from "../lib/neural"

const COUNT = 900

/**
 * Drifting dust field behind the brain. Cheap depth cue: without it the
 * additive glow has nothing to sit against and the orb reads flat.
 */
export default function Dust() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const rand = mulberry32(19)
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (rand() - 0.5) * 26
      arr[i * 3 + 1] = (rand() - 0.5) * 18
      arr[i * 3 + 2] = (rand() - 0.5) * 20 - 4
    }
    return arr
  }, [])

  const speeds = useMemo(() => {
    const rand = mulberry32(23)
    return new Float32Array(COUNT).map(() => 0.15 + rand() * 0.5)
  }, [])

  useFrame(({ clock }) => {
    const pts = ref.current
    if (!pts) return
    const t = clock.elapsedTime
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute
    const arr = attr.array as Float32Array

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      // Slow upward drift, wrapped so the field never empties out.
      arr[i3 + 1] += speeds[i] * 0.004
      if (arr[i3 + 1] > 9) arr[i3 + 1] = -9

      // Gentle sway that reacts to the cursor.
      arr[i3] += Math.sin(t * 0.25 + i * 0.35) * 0.0012 + pointer.x * 0.0009
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#6ea8ff"
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
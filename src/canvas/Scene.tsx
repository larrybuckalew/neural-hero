import { Suspense, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei"
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing"
import Brain from "./Brain"
import Dust from "./Dust"
import { scrollProgress } from "../lib/neural"

export default function Scene() {
  // Start on the light preset and only add bloom once we've confirmed the
  // device can hold a decent framerate. Phones get the scene without it.
  const [tier, setTier] = useState<"low" | "high">("low")

  return (
    <>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 7.2], fov: 42 }}
      >
        <fog attach="fog" args={["#05060a", 9, 30]} />

        <ambientLight intensity={0.35} />
        <pointLight position={[4, 3, 5]} intensity={40} color="#4f8cff" distance={16} />
        <pointLight position={[-5, -2, 4]} intensity={26} color="#8b5cf6" distance={14} />

        <Suspense fallback={null}>
          <Dust />
          <Brain />
        </Suspense>

        <ScrollCamera />

        {tier === "high" && (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.85} luminanceThreshold={0.18} mipmapBlur />
            <Vignette eskil={false} offset={0.22} darkness={0.85} />
          </EffectComposer>
        )}

        <AdaptiveDpr pixelated={false} />
        <PerformanceMonitor
          onDecline={() => setTier("low")}
          onIncline={() => setTier("high")}
        />
      </Canvas>
    </>
  )
}

/**
 * Dollies the camera along z with scroll and adds a touch of pointer sway.
 * Kept as its own component so it can hold a camera ref without fighting
 * R3F's internal camera management.
 */
function ScrollCamera() {
  // Kept far enough out that the orb always reads whole. Pushing in harder
  // looks impressive right up until the camera enters the mesh.
  const targetZ = 7.2

  useFrame(({ clock, camera }) => {
    const s = scrollProgress.current
    const t = clock.elapsedTime

    // Gentle push-in across the whole page — never more than 0.9 units.
    const z = targetZ - s * 0.9
    camera.position.z += (z - camera.position.z) * 0.05

    // Slow idle drift so the frame is never perfectly static.
    camera.position.x = Math.sin(t * 0.2) * 0.18
    camera.position.y = Math.cos(t * 0.24) * 0.13

    camera.lookAt(0, 0, 0)
  })

  return null
}
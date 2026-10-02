import Scene from "./canvas/Scene"
import Hero from "./components/Hero"
import useInteractions from "./hooks/useInteractions"

export default function App() {
  useInteractions()

  return (
    <>
      {/* Fixed canvas sits behind everything and never captures pointer
          events, so the HTML above stays selectable and scrollable. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Vignette + gradient wash keeps text legible over the glow. */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 0%, rgba(5,6,10,0.55) 70%, rgba(5,6,10,0.92) 100%)",
        }}
      />

      <main className="relative z-20">
        <Hero />
      </main>
    </>
  )
}
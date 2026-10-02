import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { pointer, scrollProgress } from "../lib/neural"

gsap.registerPlugin(ScrollTrigger)

/**
 * Feeds two globals the 3D scene reads every frame:
 *  - scrollProgress (0..1 across the whole page)
 *  - pointer (normalised -1..1, drives the cursor reaction)
 *
 * Both are plain mutable objects rather than React state — writing to them
 * per-frame through setState would re-render the tree 60x a second.
 */
export default function useInteractions() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    const onLeave = () => {
      pointer.x = 0
      pointer.y = 0
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", onLeave)

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollProgress.current = self.progress
      },
    })

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", onLeave)
      trigger.kill()
    }
  }, [])
}
import * as THREE from "three"

/**
 * Deterministic PRNG (mulberry32) so the network layout is identical on every
 * load — a brain that reshuffles itself on refresh reads as a glitch.
 */
export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Neuron = {
  /** Rest position on the sphere. */
  home: THREE.Vector3
  /** Unit normal — every neuron pushes outward along this when firing. */
  normal: THREE.Vector3
  /** Index into the synapse buffer. */
  index: number
  /** Per-neuron animation offset so pulses don't fire in lockstep. */
  phase: number
  /** Base brightness, varied so the mesh doesn't look uniform. */
  weight: number
}

export type Synapse = {
  from: number
  to: number
  length: number
}

/**
 * Builds a neuron cloud on a fibonacci sphere and wires each one to its
 * nearest neighbours. Real synapse counts stay modest: N nodes each with ~4
 * connections gives a dense enough weave without turning into soup.
 */
export function buildNetwork({
  count,
  radius,
  neighbors,
  seed = 7,
}: {
  count: number
  radius: number
  neighbors: number
  seed?: number
}): { neurons: Neuron[]; synapses: Synapse[] } {
  const rand = mulberry32(seed)
  const golden = Math.PI * (3 - Math.sqrt(5))

  const neurons: Neuron[] = []
  for (let i = 0; i < count; i++) {
    // Fibonacci sphere: even coverage without the pole clumping you'd get
    // from naive random sampling.
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i

    const normal = new THREE.Vector3(
      Math.cos(theta) * r,
      y,
      Math.sin(theta) * r,
    )

    // Slight radius jitter breaks the perfect-sphere look.
    const jitter = 0.88 + rand() * 0.28
    const home = normal.clone().multiplyScalar(radius * jitter)

    neurons.push({
      home,
      normal,
      index: i,
      phase: rand() * Math.PI * 2,
      weight: 0.55 + rand() * 0.45,
    })
  }

  // Connect each neuron to its N nearest neighbours, de-duplicated so we never
  // draw the same edge twice.
  const seen = new Set<string>()
  const synapses: Synapse[] = []

  for (const neuron of neurons) {
    const ranked = neurons
      .filter((other) => other.index !== neuron.index)
      .map((other) => ({
        to: other.index,
        dist: neuron.home.distanceToSquared(other.home),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, neighbors)

    for (const { to, dist } of ranked) {
      const key = neuron.index < to ? `${neuron.index}-${to}` : `${to}-${neuron.index}`
      if (seen.has(key)) continue
      seen.add(key)
      synapses.push({
        from: neuron.index,
        to,
        length: Math.sqrt(dist),
      })
    }
  }

  return { neurons, synapses }
}

/** Shared timeline of scroll progress (0..1) the whole scene reads from. */
export const scrollProgress = { current: 0 }

/** Pointer position in normalised device coords (-1..1), read by the brain. */
export const pointer = { x: 0, y: 0 }
# neural-hero

An interactive AI "brain" hero for an AI agency: a glowing neural-network orb
that reacts to the cursor and wakes up as you scroll into the services section.
Built with React Three Fiber + GSAP — all geometry is code-generated, no models.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/neural-hero/
npm run build      # production build (type-checks)
npm run preview    # serve dist/ on :4173
npm run typecheck  # tsc --noEmit
```

## What's in the hero

A fibonacci-sphere neuron mesh (200 nodes) wired to its nearest neighbours.
Two continuous inputs drive it:

- **Cursor** — neurons near the pointer push outward along their normal and
  brighten. Falloff is quadratic, so the reaction is strongest right under the
  cursor and gone by ~2.2 units out. The whole shell also leans via parallax.
- **Scroll** — the orb inflates and its neurons fire harder as you descend into
  the services section, so the page "wakes it up".

The Canvas is fixed behind the content with `pointer-events: none`, so the HTML
stays selectable and the page scrolls normally.

## Where things live

```
src/
  App.tsx                    scene + content layering
  main.tsx  index.css        entry + Tailwind + tokens
  lib/neural.ts              network builder, shared pointer/scroll state
  hooks/useInteractions.ts   pointer + ScrollTrigger → shared state
  canvas/
    Scene.tsx                <Canvas>, lights, fog, scroll camera
    Brain.tsx                neuron mesh + synapse threads
    Dust.tsx                 drifting background particles
  components/
    Hero.tsx                 hero copy, services grid, contact, footer
public/
  favicon.svg
```

## Tuning the brain

| Want to change | Edit |
|---|---|
| Node count / orb size | `NODE_COUNT`, `RADIUS` in `canvas/Brain.tsx` |
| Connection density | `NEIGHBORS`, and the `% 5` filter that thins the threads |
| Cursor strength / reach | `push`, `ease * 0.85`, and the `dist / 2.2` falloff |
| Scroll response | `breath`, `excite` in `Brain.tsx`; camera dolly in `Scene.tsx` |
| Node + thread colours | `glow` maths in `Brain.tsx`, `lineBasicMaterial color` |
| Theme colours | `tailwind.config.js`, `:root` in `index.css` |

## Deploying to GitHub Pages

Push to `main` and `.github/workflows/deploy.yml` runs type-check → build →
publish `dist/`. It also runs on PRs so broken builds are caught early.

**One-time setup** — Pages must be enabled and set to build with GitHub Actions,
or the workflow fails at `configure-pages` with a 404 and nothing publishes:

```bash
gh api --method POST repos/larrybuckalew/neural-hero/pages -f build_type=workflow
```

Verify with `gh api repos/larrybuckalew/neural-hero/pages` — it should report
`"build_type": "workflow"`. Re-run a failed deploy with
`gh run rerun <run-id> --repo larrybuckalew/neural-hero`.

Key details:

- **`base: "/neural-hero/"`** in `vite.config.ts` — assets resolve under the repo
  sub-path on Pages. Every absolute URL in `index.html` (the favicon) needs the
  same prefix.
- **`dist/`** is the Pages artifact. No SSR, no image optimizer — purely static.

## Performance notes

- `PerformanceMonitor` gates Bloom + Vignette: they only mount once the device
  proves it can hold framerate, so phones get the scene without postprocessing.
- `AdaptiveDpr` scales render resolution between 1x and 1.75x.
- `prefers-reduced-motion` disables the CSS scroll glide.
- The bundle is ~381 kB gzipped, almost entirely three.js. Fine for a dedicated
  3D page; don't inline this on a content site.

## QA

- `npm run build` and `npm run typecheck` both pass.
- Verified rendering at 1280x800 via Playwright against the preview server.

### One bug worth remembering

The orb initially ballooned to fill the viewport. Cause: the geometry was built
over `restPositions`, and each frame did `positionAttr.array.set(livePositions)`
— but three.js holds the **same** `Float32Array` by reference, so the "rest"
positions were overwritten with the animated ones and the outward push compounded
every frame. The fix is to build the geometry over the *live* buffer and mutate
it in place, flagging `needsUpdate` instead of copying. If you add a second
animated buffer, keep the same discipline.

## License

MIT — see `LICENSE`.
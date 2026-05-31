import { useEffect, useRef } from 'react'

// ─── Strand count ─────────────────────────────────────────────────
const NUM_STRANDS = 100

// ─── Helpers ──────────────────────────────────────────────────────
function rand(min, max) {
  return min + Math.random() * (max - min)
}

/**
 * Pick a strand colour.
 *   ~62 % near-black  #0a0a0a  — the dense dark bulk of the hair
 *   ~31 % dark red    #3a0000  — subtle warm undertone
 *    ~7 % gold        #c89116  — occasional highlight strand
 */
function pickColor() {
  const r = Math.random()
  if (r > 0.93) return [200, 145,  22]   // gold
  if (r > 0.62) return [ 58,   0,   0]   // dark red
  return               [ 10,  10,  10]   // near-black
}

/**
 * Build the full set of strand descriptors once.
 * All positions are normalised to [0, 1] so they scale to any canvas size.
 */
function buildStrands() {
  return Array.from({ length: NUM_STRANDS }, () => {
    const [cr, cg, cb] = pickColor()
    return {
      x:       rand(0, 1),          // normalised x of the top anchor
      drift:   rand(-0.04, 0.04),   // horizontal drift top → bottom
      cp1:     rand(-0.03, 0.03),   // bezier ctrl-pt 1 x offset
      cp2:     rand(-0.03, 0.03),   // bezier ctrl-pt 2 x offset
      width:   rand(0.3, 1.5),      // stroke width in px
      opacity: rand(0.2, 0.8),
      r: cr, g: cg, b: cb,
      speed:   rand(0.15, 0.45),    // sway speed  (rad / s)
      phase:   rand(0, Math.PI * 2),
      swayAmp: rand(0.005, 0.018),  // sway amplitude (normalised)
    }
  })
}

// ─── Component ────────────────────────────────────────────────────
export default function ShaderBackground() {
  const canvasRef  = useRef(null)
  const rafRef     = useRef(null)
  // Strands are generated once at mount — normalised coords adapt to any size
  const strandsRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Generate strands once
    if (!strandsRef.current) strandsRef.current = buildStrands()

    // ── Resize: match canvas backing store to its CSS size ──────────
    function resize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w
        canvas.height = h
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // ── Render loop ──────────────────────────────────────────────────
    const t0 = performance.now()

    function frame() {
      const W = canvas.width
      const H = canvas.height
      if (W === 0 || H === 0) { rafRef.current = requestAnimationFrame(frame); return }

      const t = (performance.now() - t0) / 1000   // elapsed seconds

      // Fill background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, W, H)

      // Global slow sway — all strands drift together as one mass
      const globalSway = Math.sin(t * 0.10) * 0.010

      ctx.lineCap = 'round'

      for (const s of strandsRef.current) {
        // Per-strand sway layered on top of the global motion
        const localSway = s.swayAmp * Math.sin(t * s.speed + s.phase)
        const sway      = globalSway + localSway

        // ── Bezier anchor + control points (all in pixel space) ────
        // Top anchor: strand starts at its assigned x, shifted by sway
        const x0   = (s.x + sway) * W

        // Bottom anchor: drift gives each strand a slight angle;
        // sway is attenuated (hair is heavier/less mobile at the bottom)
        const x3   = (s.x + s.drift + sway * 0.55) * W

        // Control pts carry their own curve character plus proportional sway
        const cp1x = (s.x + s.cp1 + sway * 0.88) * W
        const cp2x = (s.x + s.drift * 0.6 + s.cp2 + sway * 0.70) * W

        ctx.beginPath()
        ctx.moveTo(x0, 0)
        ctx.bezierCurveTo(
          cp1x, H * 0.33,   // first control point
          cp2x, H * 0.66,   // second control point
          x3,   H           // bottom anchor
        )

        ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},${s.opacity})`
        ctx.lineWidth   = s.width
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    // ── Cleanup on unmount ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  )
}

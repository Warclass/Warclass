'use client'

/**
 * GameVignette
 * A full-screen, pointer-events-none vignette and ground haze overlay
 * to enhance the game-like atmosphere without blocking interactions.
 */
export default function GameVignette() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30">
      {/* Outer vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.6)_100%)]" />
      {/* Ground glow/haze */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />
    </div>
  )
}

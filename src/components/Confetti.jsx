import { useMemo } from 'react'

const PUSHEENS = ['/pusheen1.png', '/pusheen2.png', '/pusheen3.png']
const rand = (min, max) => min + Math.random() * (max - min)

/**
 * Falling-Pusheen overlay. Mount it to play; remount via a changing `key` to
 * replay. 10–15 particles fall the full viewport in 1.5–2s with a slight spin.
 * Positions/durations are drawn once per mount so a parent re-render can't
 * restart the animation mid-fall.
 */
export default function Confetti({ count = 12 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: Math.max(10, Math.min(15, count)) }, (_, i) => ({
        id: i,
        src: PUSHEENS[Math.floor(Math.random() * PUSHEENS.length)],
        left: `${rand(4, 92)}%`,
        size: rand(38, 68),
        duration: `${rand(1.5, 2).toFixed(2)}s`,
        delay: `${rand(0, 0.45).toFixed(2)}s`,
        spin: `${rand(-200, 200).toFixed(0)}deg`,
        sway: `${rand(-50, 50).toFixed(0)}px`,
      })),
    // Intentionally mount-only: see docblock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          className="pusheen-particle absolute top-0 object-contain"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            '--duration': p.duration,
            '--delay': p.delay,
            '--spin': p.spin,
            '--sway': p.sway,
          }}
        />
      ))}
    </div>
  )
}

/** Shared chunky/fluffy primitives. Colored drop shadows, rounded-3xl, no checkmarks. */

const TONES = {
  pink: { face: 'bg-pink-primary text-white', slab: '#b02d77', glow: 'rgba(230,75,157,.35)' },
  purple: { face: 'bg-purple-soft text-white', slab: '#8457cc', glow: 'rgba(180,134,246,.38)' },
  peach: { face: 'bg-peach text-ink', slab: '#e8a3c2', glow: 'rgba(255,203,224,.65)' },
  cream: { face: 'bg-white text-ink', slab: '#ded4f0', glow: 'rgba(180,134,246,.28)' },
  correct: { face: 'bg-correct text-white', slab: '#1d8347', glow: 'rgba(47,181,98,.35)' },
  wrong: { face: 'bg-wrong text-white', slab: '#a62733', glow: 'rgba(226,59,78,.35)' },
}

/** Chunky 3D button: a solid slab under the face, which drops onto it when pressed. */
export function ChunkyButton({
  tone = 'pink',
  children,
  className = '',
  style,
  full = false,
  size = 'md',
  ...props
}) {
  const t = TONES[tone] ?? TONES.pink
  const pad = size === 'sm' ? 'px-4 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3.5'
  return (
    <button
      {...props}
      className={`chunky ${t.face} ${pad} ${full ? 'w-full' : ''} rounded-3xl font-extrabold tracking-wide select-none ${className}`}
      style={{ boxShadow: `0 5px 0 ${t.slab}, 0 12px 24px -6px ${t.glow}`, ...style }}
    >
      {children}
    </button>
  )
}

/** Fluffy card with a soft pastel shadow. */
export function ChunkyCard({ children, className = '', tone = 'cream', ...props }) {
  const t = TONES[tone] ?? TONES.cream
  return (
    <div
      {...props}
      className={`rounded-3xl bg-white/85 backdrop-blur-sm p-5 border border-white ${className}`}
      style={{ boxShadow: `0 6px 0 ${t.slab}22, 0 18px 36px -12px ${t.glow}` }}
    >
      {children}
    </div>
  )
}

export function ProgressBar({ value, tone = 'pink' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="h-3.5 w-full rounded-full bg-lavender overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)}>
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${
          tone === 'purple' ? 'bg-purple-soft' : 'bg-pink-primary'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/** Cat paw — stands in for every checkmark in the app. */
export function Paw({ className = 'w-7 h-7', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill={color} aria-hidden="true">
      <ellipse cx="32" cy="42" rx="15" ry="12.5" />
      <ellipse cx="14" cy="25" rx="7" ry="8.5" />
      <ellipse cx="26" cy="15" rx="7" ry="9" />
      <ellipse cx="40" cy="15" rx="7" ry="9" />
      <ellipse cx="52" cy="25" rx="7" ry="8.5" />
    </svg>
  )
}

/** The mascot, bobbing. Local asset — no network fetch. */
export function Pusheen({ src = '/pusheen3.png', size = 120, className = '', bob = true }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`${bob ? 'bob' : ''} object-contain pointer-events-none ${className}`}
      style={{ width: size, height: size, filter: 'drop-shadow(0 10px 18px rgba(230,75,157,.3))' }}
    />
  )
}

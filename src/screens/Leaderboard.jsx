import { useEffect, useState } from 'react'
import { ChunkyCard, Paw, Pusheen } from '../components/ui.jsx'
import { msUntilNextBotTick } from '../lib/storage.js'

const MEDALS = ['bg-pink-primary', 'bg-purple-soft', 'bg-peach']

/**
 * Passive leaderboard. Bot growth itself lives in App (storage.advanceBots on
 * mount + window focus); this component only renders and counts down.
 */
export default function Leaderboard({ user, bots }) {
  const [left, setLeft] = useState(() => msUntilNextBotTick())

  useEffect(() => {
    const id = setInterval(() => setLeft(msUntilNextBotTick()), 1000)
    return () => clearInterval(id)
  }, [bots])

  const rows = [...bots.map((b) => ({ ...b, isUser: false })), { ...user, isUser: true }].sort(
    (a, b) => b.score - a.score
  )

  const mins = Math.floor(left / 60000)
  const secs = Math.floor((left % 60000) / 1000)

  return (
    <ChunkyCard tone="pink" className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-extrabold text-lg flex items-center gap-2">
          <Paw className="w-5 h-5 text-pink-primary" /> Tablica wyników
        </h2>
        <span className="text-xs font-bold text-ink/45 tabular-nums">
          koty uczą się za {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>

      <ol className="space-y-2">
        {rows.map((row, i) => (
          <li
            key={row.name}
            className={`flex items-center gap-3 rounded-3xl px-3 py-2.5 ${
              row.isUser ? 'bg-peach/70 ring-2 ring-pink-primary/35' : 'bg-lavender/55'
            }`}
          >
            <span
              className={`grid place-items-center w-8 h-8 rounded-2xl font-black text-sm shrink-0 ${
                MEDALS[i] ?? 'bg-white'
              } ${i < 2 ? 'text-white' : 'text-ink'}`}
            >
              {i + 1}
            </span>
            <span className={`flex-1 font-bold truncate ${row.isUser ? 'text-pink-primary' : ''}`}>
              {row.name}
              {row.isUser && <span className="ml-1.5 text-xs font-extrabold text-ink/45">(to Ty!)</span>}
            </span>
            {row.isUser && <Pusheen size={28} bob={false} src="/pusheen1.png" />}
            <span className="font-black tabular-nums shrink-0">{row.score}</span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-ink/45 font-semibold text-center">
        Koty-rywale zdobywają 20–40 punktów za każde 15 minut Twojej nieobecności.
      </p>
    </ChunkyCard>
  )
}

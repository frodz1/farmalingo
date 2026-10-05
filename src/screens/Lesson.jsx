import { useMemo, useState } from 'react'
import { ChunkyButton, ChunkyCard, Paw, Pusheen } from '../components/ui.jsx'
import Confetti from '../components/Confetti.jsx'
import { answerStep, XP_PER_CORRECT } from '../lib/lesson.js'

const PRAISE = ['Mruu! Dobrze!', 'Perfekcyjnie!', 'Kot jest dumny!', 'Tak jest!', 'Super!']

/**
 * One node's run. The queue is the whole engine: a miss re-appends the question
 * at the tail, so the node closes only once the queue drains.
 */
export default function Lesson({ node, onComplete, onExit }) {
  const [queue, setQueue] = useState(node.items)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('answering') // 'answering' | 'correct' | 'wrong'
  const [confettiKey, setConfettiKey] = useState(0)

  // First-attempt accuracy drives Elo, so a question only counts the first time
  // it is seen — coming back around after a miss can't repair the score.
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [attempted, setAttempted] = useState(() => new Set())
  const [solved, setSolved] = useState(() => new Set())
  const [xp, setXp] = useState(0)

  const current = queue[0]
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [confettiKey])
  const progress = solved.size / node.items.length

  function check() {
    if (!current || selected === null || phase !== 'answering') return
    const wasCorrect = selected === current.answer

    if (!attempted.has(current.id)) {
      setAttempted((prev) => new Set(prev).add(current.id))
      if (wasCorrect) setFirstTryCorrect((n) => n + 1)
    }

    if (wasCorrect) {
      setSolved((prev) => new Set(prev).add(current.id))
      setXp((n) => n + XP_PER_CORRECT)
      setConfettiKey((k) => k + 1)
    }
    setPhase(wasCorrect ? 'correct' : 'wrong')
  }

  /** Continue always moves to the NEXT question; a missed one waits at the tail. */
  function advance() {
    const next = answerStep(queue, phase === 'correct')
    setQueue(next)
    setSelected(null)
    setPhase('answering')
    if (next.length === 0) {
      onComplete({ firstTryCorrect, total: node.items.length, xp })
    }
  }

  if (!current) return null

  const isCorrect = phase === 'correct'
  const isWrong = phase === 'wrong'
  const answered = phase !== 'answering'

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-5 pb-44 min-h-full">
      {isCorrect && <Confetti key={confettiKey} count={13} />}

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onExit}
          aria-label="Zamknij lekcję"
          className="chunky shrink-0 grid place-items-center w-10 h-10 rounded-2xl bg-white text-ink/45 font-black text-xl"
          style={{ boxShadow: '0 4px 0 #ded4f0' }}
        >
          ×
        </button>
        <div className="flex-1">
          <div className="h-3.5 w-full rounded-full bg-lavender overflow-hidden">
            <div
              className="h-full rounded-full bg-pink-primary transition-[width] duration-500 ease-out"
              style={{ width: `${Math.min(1, progress) * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-xs font-black text-ink/45 tabular-nums">{queue.length} w kolejce</span>
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-purple-soft mb-2">{current.label}</p>

      {current.passage && (
        <ChunkyCard tone="purple" className="mb-4 !bg-lavender/50">
          <p className="text-sm leading-relaxed font-semibold text-ink/80">{current.passage}</p>
        </ChunkyCard>
      )}

      <h2 className="text-2xl font-black leading-snug mb-5">{current.prompt}</h2>

      <div className="space-y-3">
        {current.options.map((opt) => {
          const chosen = selected === opt
          const revealCorrect = answered && opt === current.answer
          const revealWrong = answered && chosen && !isCorrect

          let look = 'bg-white border-lavender text-ink'
          let slab = '#ded4f0'
          if (revealCorrect) {
            look = 'bg-correct-soft border-correct text-correct'
            slab = '#9ad9b4'
          } else if (revealWrong) {
            look = 'bg-wrong-soft border-wrong text-wrong'
            slab = '#f0a8b1'
          } else if (chosen) {
            look = 'bg-peach/60 border-pink-primary text-ink'
            slab = '#e8a3c2'
          }

          return (
            <button
              key={opt}
              onClick={() => !answered && setSelected(opt)}
              disabled={answered}
              aria-pressed={chosen}
              className={`chunky w-full text-left rounded-3xl border-2 px-5 py-4 font-bold flex items-center gap-3 ${look} ${
                answered ? 'disabled:opacity-100' : ''
              }`}
              style={{ boxShadow: `0 5px 0 ${slab}` }}
            >
              <span className="flex-1">{opt}</span>
              {revealCorrect && <Paw className="w-6 h-6 shrink-0 text-correct" />}
              {revealWrong && <span className="shrink-0 font-black text-lg">×</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback bar: green/red state, but the Continue button stays pastel. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t-2 ${
          isCorrect
            ? 'bg-correct-soft border-correct/30'
            : isWrong
              ? 'bg-wrong-soft border-wrong/30'
              : 'bg-cream/95 border-lavender'
        } backdrop-blur-sm`}
      >
        <div className="mx-auto w-full max-w-xl px-4 py-4">
          {answered ? (
            <div className="flex items-center gap-3 pop-in">
              {isCorrect ? (
                <Pusheen size={54} bob={false} src="/pusheen1.png" />
              ) : (
                <Pusheen size={54} bob={false} src="/pusheen3.png" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`font-black text-lg ${isCorrect ? 'text-correct' : 'text-wrong'}`}>
                  {isCorrect ? praise : 'Prawie! Kot to zapamięta.'}
                </p>
                {isWrong && (
                  <p className="text-sm font-bold text-ink/70 truncate">
                    Poprawnie: <span className="text-wrong">{current.answer}</span>
                  </p>
                )}
              </div>
              <ChunkyButton tone="peach" onClick={advance} className="shrink-0" autoFocus>
                Dalej
              </ChunkyButton>
            </div>
          ) : (
            <ChunkyButton tone="pink" full size="lg" onClick={check} disabled={selected === null}>
              Sprawdź
            </ChunkyButton>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { ChunkyButton, ChunkyCard, Pusheen } from '../components/ui.jsx'
import Leaderboard from './Leaderboard.jsx'
import { MOCK_LESSON_JSON } from '../data/mockLesson.js'

const GEMINI_PROMPT = `Generate a comprehensive study lesson based on the provided document as a single JSON object. Return ONLY the JSON, no markdown fences, no commentary.

Schema:
{
  "title": "short lesson title",
  "subject": "e.g. Biology, Physics, Cloud Computing",
  "flashcards": [ {"concept":"...","definition":"..."} ],
  "cloze":      [ {"sentence":"A sentence with ___ blank","options":["a","b","c"],"answer":"a"} ],
  "quiz":       [ {"passage":"short paragraph","question":"...","options":["a","b","c","d"],"answer":"a"} ]
}

Rules:
- Extract the maximum possible knowledge from the file. Do not limit the output.
- Every cloze sentence MUST contain the substring "___" (three underscores).
- Each "answer" MUST appear verbatim in its "options" array.`

export default function Home({ onStart, user, bots, error }) {
  const [raw, setRaw] = useState('')
  // Hidden debug affordance: the mascot is the unlock, so it stays out of the way.
  const [debugVisible, setDebugVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(GEMINI_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 space-y-6">
      <header className="text-center space-y-1">
        <div
          className="inline-block cursor-pointer"
          onClick={() => setDebugVisible((v) => !v)}
          title="Psst… kliknij kotka"
        >
          <Pusheen size={132} />
        </div>
        <h1 className="text-4xl font-black text-pink-primary tracking-tight">Farmalingo</h1>
        <p className="text-ink/60 font-semibold">Wklej lekcję z Gemini i ucz się jak kot 🐾</p>
      </header>

      <ChunkyCard tone="purple" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-extrabold text-lg">Twoja lekcja</h2>
          <ChunkyButton tone="peach" size="sm" onClick={copyPrompt}>
            {copied ? 'Skopiowano!' : 'Kopiuj prompt'}
          </ChunkyButton>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='{ "title": "...", "subject": "...", "flashcards": [...], "cloze": [...], "quiz": [...] }'
          spellCheck={false}
          rows={8}
          className="w-full rounded-3xl bg-cream border-2 border-lavender focus:border-purple-soft focus:outline-none p-4 font-mono text-xs leading-relaxed text-ink resize-y placeholder:text-ink/35"
        />

        {error && (
          <p className="rounded-3xl bg-wrong-soft text-wrong font-bold text-sm px-4 py-3 pop-in">{error}</p>
        )}

        <ChunkyButton tone="pink" full size="lg" onClick={() => onStart(raw)} disabled={!raw.trim()}>
          Zaczynamy!
        </ChunkyButton>

        {debugVisible && (
          <div className="pop-in space-y-2 pt-1">
            <p className="text-xs font-bold text-ink/45 text-center uppercase tracking-widest">tryb debug</p>
            <ChunkyButton tone="cream" full size="sm" onClick={() => setRaw(MOCK_LESSON_JSON)}>
              Szybki test — wczytaj przykład
            </ChunkyButton>
          </div>
        )}
      </ChunkyCard>

      <Leaderboard user={user} bots={bots} />
    </div>
  )
}

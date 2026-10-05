# Farmalingo — web

React + Vite + Tailwind. The whole app — it replaced an earlier SwiftUI port,
which has been removed. Fully local and client-side: no backend, no network calls, no analytics. Paste a lesson JSON →
walk a Duolingo-style map → beat the cat bots on the leaderboard.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve dist/ locally
```

## Deploy to Netlify

`netlify.toml` is checked in and configured for this subfolder:

| setting | value |
| --- | --- |
| base directory | `web` |
| build command | `npm run build` |
| publish directory | `dist` |

Connect the repo and Netlify reads the file as-is. Or drag-and-drop `web/dist/`
onto the Netlify dashboard. The SPA redirect rule is already in place.

## Architecture

```
src/
  App.jsx                 single state owner: screen + plan + progress + user/bots
  screens/
    Home.jsx              paste textarea, Start, hidden debug button, leaderboard
    MapScreen.jsx         curving vertical node path (SVG dotted spine + sine offset)
    Lesson.jsx            one node's run — the repetition queue engine
    Leaderboard.jsx       render + countdown only; growth lives in lib/storage.js
  components/
    ui.jsx                ChunkyButton / ChunkyCard / ProgressBar / Paw / Pusheen
    Confetti.jsx          falling-Pusheen overlay
  lib/
    lesson.js             PURE: parse → validate → build plan → answerStep
    storage.js            localStorage: user score/XP + passive bot growth + Elo
  data/mockLesson.js      payload behind the debug button
public/
  pusheen1.png  pusheen2.png  pusheen3.png
```

State lives in `App.jsx` with `useState` — three screens and one plan did not
justify a router or a store. `lib/` holds every pure decision, which is what
makes the behaviour below testable without a DOM.

## Lesson JSON

```json
{
  "title": "...",
  "subject": "...",
  "flashcards": [{ "concept": "", "definition": "" }],
  "cloze": [{ "sentence": "A sentence with ___", "options": [], "answer": "" }],
  "quiz": [{ "passage": "", "question": "", "options": [], "answer": "" }]
}
```

Tolerated on paste: ```` ```json ```` fences, leading/trailing prose, smart
quotes, non-breaking spaces. An `answer` missing from its own `options` array is
repaired (appended) rather than dropped — the generator slips on this often.
Malformed entries are filtered; if nothing survives, the paste is rejected with a
message instead of an empty map.

## Behaviour worth knowing

**Map chunking.** `flashcards` and `cloze` are interleaved into one pool (so a
node isn't 8 identical-looking cards) and chunked 8 per node; the last learning
node holds the remainder. A single `quiz` node is always absolutely last, and is
omitted when `quiz` is empty. Flashcards have no options in the schema, so each
becomes multiple choice from its own definition plus 2 sibling distractors.

**Repetition queue.** `answerStep(queue, wasCorrect)` pops the head, and on a
miss re-appends that *same* question at the tail. Continue therefore always moves
to the next question, and the node closes only when the queue drains — 8 items
with 2 misses takes 10 steps. Elo uses *first-attempt* accuracy, so a question
coming back around cannot repair the score; XP is paid per correct answer.

**Passive bots.** `advanceBots()` grants every bot a random 20–40 per *full*
15-minute window since `lastBotUpdateTime`, then carries the unused remainder of
the window forward in the new timestamp. That makes it idempotent — safe under
StrictMode double-effects and the focus/visibilitychange double-fire, and it
cannot be farmed by refreshing. Bots only ever gain. A clock that has moved
backwards resets the window instead of awarding anything. Starting a new lesson
resets the roster so idle growth isn't an unclosable gap.

**Confetti.** 13 particles, each a random one of the three PNGs, falling the full
viewport in 1.5–2 s with random x, spin, sway and delay. Randomness is drawn once
per mount into CSS custom properties, so the keyframes stay static (compositor-
friendly) and a parent re-render can't restart a fall mid-air. Replays via a
changing `key`.

**Debug button.** Hidden by default — click the Pusheen on the home screen to
reveal "Szybki test", which fills the textarea with `data/mockLesson.js`.

## Notes / known limits

- `public/pusheen2.png` came from a JPEG, so it has no alpha channel and falls as
  an opaque rectangle. Replace it with a cutout PNG for the intended look;
  `pusheen1`/`pusheen3` are already transparent.
- No test runner is wired up. `lib/lesson.js` and `lib/storage.js` are pure
  (storage takes an injectable `now`), so they drop straight into Vitest when you
  want coverage on parsing, chunking, the repetition queue and bot growth.
- Progress is deliberately not persisted — a reload returns you to the paste
  screen. Only score, lifetime XP and bots survive.
- `prefers-reduced-motion` disables confetti, bobbing and press animations.

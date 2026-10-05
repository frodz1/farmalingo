import { useCallback, useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import MapScreen from './screens/MapScreen.jsx'
import Lesson from './screens/Lesson.jsx'
import { parseLesson, buildPlan } from './lib/lesson.js'
import { advanceBots, resetBots, loadUser, saveUser, eloDelta, DEFAULT_USER } from './lib/storage.js'

/**
 * Single owner of app state — no router, no store. Three screens:
 *   home  → paste JSON
 *   map   → pick a node
 *   lesson→ run one node's queue
 *
 * Persisted across reloads: user score/XP and the bot roster (localStorage).
 * Ephemeral (cleared by "Od nowa"): the parsed plan and node progress.
 */
export default function App() {
  const [screen, setScreen] = useState('home')
  const [plan, setPlan] = useState(null)
  const [completed, setCompleted] = useState([]) // node ids
  const [activeIndex, setActiveIndex] = useState(null)
  const [error, setError] = useState('')
  const [eloApplied, setEloApplied] = useState(false)

  const [user, setUser] = useState(loadUser)
  const [bots, setBots] = useState(() => advanceBots().bots)

  // Passive growth: catch up whenever the tab comes back into focus. advanceBots
  // is window-aligned and idempotent, so double-fires award nothing extra.
  useEffect(() => {
    const catchUp = () => {
      if (document.visibilityState === 'visible') setBots(advanceBots().bots)
    }
    window.addEventListener('focus', catchUp)
    document.addEventListener('visibilitychange', catchUp)
    return () => {
      window.removeEventListener('focus', catchUp)
      document.removeEventListener('visibilitychange', catchUp)
    }
  }, [])

  useEffect(() => saveUser(user), [user])

  const handleStart = useCallback((raw) => {
    const result = parseLesson(raw)
    if (result.error) {
      setError(result.error)
      return
    }
    setError('')
    setPlan(buildPlan(result.lesson))
    setCompleted([])
    setEloApplied(false)
    // New lesson → fresh roster, so idle bot growth isn't an unclosable gap.
    setBots(resetBots())
    setScreen('map')
  }, [])

  const handleReset = useCallback(() => {
    setPlan(null)
    setCompleted([])
    setActiveIndex(null)
    setEloApplied(false)
    setError('')
    setScreen('home')
  }, [])

  const handleNodeComplete = useCallback(
    ({ firstTryCorrect, total, xp }) => {
      const node = plan.nodes[activeIndex]
      const nextCompleted = completed.includes(node.id) ? completed : [...completed, node.id]
      const lessonDone = nextCompleted.length === plan.nodes.length

      setUser((prev) => {
        const accuracy = total > 0 ? firstTryCorrect / total : 0
        // Elo settles once, when the final node lands; replays only earn XP.
        const delta = lessonDone && !eloApplied ? eloDelta(prev.score, bots, accuracy) : 0
        return {
          ...prev,
          score: Math.max(400, prev.score + delta),
          lifetimeXP: prev.lifetimeXP + xp,
        }
      })

      if (lessonDone) setEloApplied(true)
      setCompleted(nextCompleted)
      setActiveIndex(null)
      setScreen('map')
    },
    [plan, activeIndex, completed, bots, eloApplied]
  )

  if (screen === 'lesson' && plan && activeIndex !== null) {
    return (
      <Lesson
        key={plan.nodes[activeIndex].id}
        node={plan.nodes[activeIndex]}
        onComplete={handleNodeComplete}
        onExit={() => {
          setActiveIndex(null)
          setScreen('map')
        }}
      />
    )
  }

  if (screen === 'map' && plan) {
    return (
      <MapScreen
        plan={plan}
        completed={completed}
        user={user}
        onReset={handleReset}
        onOpenNode={(i) => {
          setActiveIndex(i)
          setScreen('lesson')
        }}
      />
    )
  }

  return <Home onStart={handleStart} user={user} bots={bots} error={error} />
}

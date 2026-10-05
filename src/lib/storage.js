/**
 * localStorage-backed persistence: user XP/Elo + the passive bot leaderboard.
 * Every read is defensive — private mode and cleared site data both return null
 * or throw, and the app must still boot.
 */

const KEYS = {
  bots: 'farmalingo.bots.v1',
  lastBotUpdate: 'lastBotUpdateTime',
  user: 'farmalingo.user.v1',
}

export const BOT_CYCLE_MS = 15 * 60 * 1000 // 15 full minutes
const BOT_GAIN_MIN = 20
const BOT_GAIN_MAX = 40

export const DEFAULT_BOTS = [
  { name: 'Ambitna_Anna', score: 1080 },
  { name: 'Szybki_Tomek', score: 1020 },
  { name: 'LingwoManiak', score: 1150 },
  { name: 'Wujek_Staszek', score: 940 },
  { name: 'Kotka_Zosia', score: 990 },
  { name: 'Bystra_Kasia', score: 1060 },
  { name: 'Mądra_Marta', score: 1005 },
]

export const DEFAULT_USER = { name: 'Ty', score: 1000, lifetimeXP: 0 }

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or blocked storage — in-memory state stays correct for this session */
  }
}

export const loadUser = () => ({ ...DEFAULT_USER, ...read(KEYS.user, null) })
export const saveUser = (user) => write(KEYS.user, user)

const randomGain = () =>
  BOT_GAIN_MIN + Math.floor(Math.random() * (BOT_GAIN_MAX - BOT_GAIN_MIN + 1))

/**
 * Advance every bot by a random 20–40 for each full 15-minute window elapsed
 * since `lastBotUpdateTime`, then persist. Bots only ever gain.
 *
 * Idempotent by construction: the new timestamp carries the leftover remainder
 * forward, so a second call inside the same window awards nothing (which is what
 * makes it safe under StrictMode double-effects and focus/visibility double-fires).
 *
 * @returns {{bots: Array, cycles: number, gained: number}}
 */
export function advanceBots(now = Date.now()) {
  const bots = read(KEYS.bots, null) ?? DEFAULT_BOTS
  const last = Number(read(KEYS.lastBotUpdate, null))

  // First run (or corrupted timestamp): start the clock, award nothing.
  if (!Number.isFinite(last) || last <= 0 || last > now) {
    write(KEYS.bots, bots)
    write(KEYS.lastBotUpdate, now)
    return { bots, cycles: 0, gained: 0 }
  }

  const cycles = Math.floor((now - last) / BOT_CYCLE_MS)
  if (cycles <= 0) return { bots, cycles: 0, gained: 0 }

  let gained = 0
  const grown = bots.map((bot) => {
    let score = bot.score
    for (let i = 0; i < cycles; i++) {
      const g = randomGain()
      score += g
      gained += g
    }
    return { ...bot, score }
  })

  write(KEYS.bots, grown)
  // Keep the cadence aligned: hand the unused remainder of the window forward.
  write(KEYS.lastBotUpdate, now - ((now - last) % BOT_CYCLE_MS))
  return { bots: grown, cycles, gained }
}

/** Milliseconds until the next bot payout — drives the countdown in the UI. */
export function msUntilNextBotTick(now = Date.now()) {
  const last = Number(read(KEYS.lastBotUpdate, null))
  if (!Number.isFinite(last) || last <= 0 || last > now) return BOT_CYCLE_MS
  return BOT_CYCLE_MS - ((now - last) % BOT_CYCLE_MS)
}

/** Fresh lesson → reset the roster so idle bot growth isn't an unclosable gap. */
export function resetBots(now = Date.now()) {
  write(KEYS.bots, DEFAULT_BOTS)
  write(KEYS.lastBotUpdate, now)
  return DEFAULT_BOTS
}

/** Elo against the bot field's average, scored on first-attempt accuracy. */
export function eloDelta(userScore, bots, accuracy) {
  if (!bots.length) return 0
  const field = bots.reduce((sum, b) => sum + b.score, 0) / bots.length
  const expected = 1 / (1 + Math.pow(10, (field - userScore) / 400))
  return Math.round(32 * (accuracy - expected))
}

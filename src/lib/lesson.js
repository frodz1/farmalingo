/**
 * Lesson domain logic: paste → parse → question pool → map nodes → answer queue.
 * Pure functions only, so this file is the piece worth unit-testing.
 */

export const ITEMS_PER_NODE = 8

/* ------------------------------------------------------------------ parsing */

/** Smart quotes / NBSP / ```json fences are what actually break real pastes. */
function extractJSON(raw) {
  const normalized = raw
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/ /g, ' ')
  const start = normalized.indexOf('{')
  const end = normalized.lastIndexOf('}')
  return start !== -1 && end > start ? normalized.slice(start, end + 1) : normalized
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0

/**
 * Parse a pasted payload into a validated lesson.
 * @returns {{lesson: object}|{error: string}} — never throws.
 */
export function parseLesson(raw) {
  if (!raw || !raw.trim()) {
    return { error: 'Pole jest puste. Wklej JSON i spróbuj ponownie.' }
  }

  let data
  try {
    data = JSON.parse(extractJSON(raw.trim()))
  } catch (e) {
    return { error: `To nie jest poprawny JSON: ${e.message}` }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'Oczekiwano obiektu JSON na najwyższym poziomie.' }
  }

  const flashcards = (Array.isArray(data.flashcards) ? data.flashcards : []).filter(
    (f) => f && isNonEmptyString(f.concept) && isNonEmptyString(f.definition)
  )
  const cloze = (Array.isArray(data.cloze) ? data.cloze : []).filter(
    (c) => c && isNonEmptyString(c.sentence) && Array.isArray(c.options) && isNonEmptyString(c.answer)
  )
  const quiz = (Array.isArray(data.quiz) ? data.quiz : []).filter(
    (q) => q && isNonEmptyString(q.question) && Array.isArray(q.options) && isNonEmptyString(q.answer)
  )

  if (flashcards.length + cloze.length + quiz.length === 0) {
    return { error: 'JSON nie zawiera żadnych pytań (flashcards / cloze / quiz).' }
  }

  // An answer missing from its own options array can never be picked — repair it
  // rather than dropping the question, since the generator slips on this often.
  for (const item of [...cloze, ...quiz]) {
    if (!item.options.includes(item.answer)) item.options = [...item.options, item.answer]
  }

  return {
    lesson: {
      title: isNonEmptyString(data.title) ? data.title : 'Lekcja',
      subject: isNonEmptyString(data.subject) ? data.subject : '',
      flashcards,
      cloze,
      quiz,
    },
  }
}

/* ------------------------------------------------------- question pool + map */

function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Alternate the two lists so a node never turns into 8 identical-looking cards. */
function interleave(a, b) {
  const out = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i])
    if (i < b.length) out.push(b[i])
  }
  return out
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Turn a lesson into the map: N learning nodes of ITEMS_PER_NODE items
 * (the last one holds the remainder) plus one final quiz node.
 */
export function buildPlan(lesson) {
  let uid = 0

  // Flashcards carry no options, so build multiple choice from sibling definitions.
  const definitions = lesson.flashcards.map((f) => f.definition)
  const flashQs = lesson.flashcards.map((f) => {
    const distractors = shuffle(definitions.filter((d) => d !== f.definition)).slice(0, 2)
    return {
      id: `f${uid++}`,
      kind: 'flashcard',
      label: 'Fiszka',
      passage: null,
      prompt: `Która definicja pasuje do „${f.concept}”?`,
      options: shuffle([f.definition, ...distractors]),
      answer: f.definition,
    }
  })

  const clozeQs = lesson.cloze.map((c) => ({
    id: `c${uid++}`,
    kind: 'cloze',
    label: 'Uzupełnij lukę',
    passage: null,
    prompt: c.sentence.replace(/___/g, ' ______ '),
    options: shuffle(c.options),
    answer: c.answer,
  }))

  const quizQs = lesson.quiz.map((q) => ({
    id: `q${uid++}`,
    kind: 'quiz',
    label: 'Zrozumienie tekstu',
    passage: isNonEmptyString(q.passage) ? q.passage : null,
    prompt: q.question,
    options: shuffle(q.options),
    answer: q.answer,
  }))

  const learningNodes = chunk(interleave(flashQs, clozeQs), ITEMS_PER_NODE).map((items, i) => ({
    id: `node-${i}`,
    kind: 'learning',
    title: `Etap ${i + 1}`,
    items,
  }))

  // The quiz node is always absolutely last; omitted entirely if there is no quiz.
  const nodes = quizQs.length
    ? [...learningNodes, { id: 'node-test', kind: 'test', title: 'Test końcowy', items: quizQs }]
    : learningNodes

  return { title: lesson.title, subject: lesson.subject, nodes }
}

/* ------------------------------------------------------- in-lesson queue step */

/**
 * One step of the repetition queue: drop the head, and on a miss send that same
 * question to the very END so the node stays open until it is answered right.
 * Returns a new array — never mutates.
 */
export function answerStep(queue, wasCorrect) {
  if (queue.length === 0) return queue
  const [head, ...rest] = queue
  return wasCorrect ? rest : [...rest, head]
}

export const XP_PER_CORRECT = 10

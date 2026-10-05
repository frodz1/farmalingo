import { ChunkyButton, ChunkyCard, Paw, Pusheen } from '../components/ui.jsx'

const NODE = 86 // px
const ROW = 128 // vertical pitch between nodes
const AMPLITUDE = 34 // % of track width the path swings either side of centre

/** Duolingo-style snake: a sine over the node index. */
const offsetFor = (i) => Math.sin(i * 0.9) * AMPLITUDE

export default function MapScreen({ plan, completed, onOpenNode, onReset, user }) {
  const total = plan.nodes.length
  const done = completed.length
  // Nodes unlock in order; the first unfinished one is the only live target.
  const currentIndex = plan.nodes.findIndex((n) => !completed.includes(n.id))
  const allDone = currentIndex === -1

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <ChunkyCard tone="purple" className="sticky top-3 z-20 !py-3.5 mb-6">
        <div className="flex items-center gap-3">
          <Pusheen size={44} bob={false} src="/pusheen1.png" />
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold truncate leading-tight">{plan.title}</h1>
            <p className="text-xs font-bold text-ink/50 truncate">
              {plan.subject ? `${plan.subject} · ` : ''}
              {done}/{total} etapów · {user.score} pkt
            </p>
          </div>
          <ChunkyButton tone="peach" size="sm" onClick={onReset}>
            Od nowa
          </ChunkyButton>
        </div>
      </ChunkyCard>

      {allDone && (
        <ChunkyCard tone="pink" className="mb-6 text-center space-y-2 pop-in">
          <Pusheen size={96} />
          <h2 className="text-2xl font-black text-pink-primary">Cała lekcja zaliczona!</h2>
          <p className="font-semibold text-ink/60">
            Twój wynik: <span className="font-black text-ink">{user.score}</span> pkt ·{' '}
            {user.lifetimeXP} XP łącznie
          </p>
        </ChunkyCard>
      )}

      {/* Track: nodes are absolutely placed so the dotted path can run behind them. */}
      <div className="relative" style={{ height: total * ROW + NODE }}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 100 ${total * ROW + NODE}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={plan.nodes
              .map((_, i) => {
                const x = 50 + offsetFor(i)
                const y = i * ROW + NODE / 2
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
              })
              .join(' ')}
            fill="none"
            stroke="#d9cdf2"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="5 7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {plan.nodes.map((node, i) => {
          const isDone = completed.includes(node.id)
          const isCurrent = i === currentIndex
          const isLocked = !isDone && !isCurrent
          const isTest = node.kind === 'test'

          return (
            <div
              key={node.id}
              className="absolute flex flex-col items-center gap-1.5"
              style={{
                top: i * ROW,
                left: `calc(50% + ${offsetFor(i)}%)`,
                transform: 'translateX(-50%)',
              }}
            >
              <button
                onClick={() => !isLocked && onOpenNode(i)}
                disabled={isLocked}
                aria-label={`${node.title}${isDone ? ' — zaliczony' : isLocked ? ' — zablokowany' : ''}`}
                className={`chunky grid place-items-center rounded-full font-black ${
                  isDone
                    ? 'bg-pink-primary text-white'
                    : isCurrent
                      ? isTest
                        ? 'bg-purple-soft text-white'
                        : 'bg-peach text-ink'
                      : 'bg-lavender text-ink/35'
                }`}
                style={{
                  width: NODE,
                  height: NODE,
                  boxShadow: isDone
                    ? '0 6px 0 #b02d77, 0 16px 28px -8px rgba(230,75,157,.45)'
                    : isCurrent
                      ? isTest
                        ? '0 6px 0 #8457cc, 0 16px 28px -8px rgba(180,134,246,.5)'
                        : '0 6px 0 #e8a3c2, 0 16px 28px -8px rgba(255,203,224,.8)'
                      : '0 5px 0 #ded4f0',
                }}
              >
                {isDone ? (
                  <Paw className="w-11 h-11 text-white" />
                ) : isLocked ? (
                  <LockIcon />
                ) : isTest ? (
                  <span className="text-xl tracking-tight">TEST</span>
                ) : (
                  <span className="text-3xl tabular-nums">{i + 1}</span>
                )}
              </button>

              <span
                className={`text-xs font-extrabold whitespace-nowrap ${
                  isLocked ? 'text-ink/30' : 'text-ink/65'
                }`}
              >
                {node.title} · {node.items.length}
              </span>

              {isCurrent && !allDone && (
                <span className="absolute -right-12 top-1 bob hidden sm:block">
                  <Pusheen size={46} bob={false} />
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="11" rx="3.5" fill="currentColor" stroke="none" opacity=".55" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" strokeLinecap="round" />
    </svg>
  )
}

import { useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Download } from 'lucide-react'

// ─── Career milestones — winding road bottom (now) → top (dream job) ────────
const MILESTONES = [
  { id: 'm0',  x: 240, y: 838, label: 'Journey Begins',    month: 'MAY 2026',  color: '#818cf8', desc: 'Search launched' },
  { id: 'm1',  x: 148, y: 762, label: 'Resume Polished',   month: '',          color: '#a78bfa', desc: 'ATS-ready & sharp' },
  { id: 'm2',  x: 332, y: 690, label: 'LinkedIn Ready',    month: 'JUN 2026',  color: '#c084fc', desc: 'Profile optimized' },
  { id: 'm3',  x: 142, y: 618, label: '10 Applications',   month: '',          color: '#e879f9', desc: 'Pipeline started' },
  { id: 'm4',  x: 338, y: 548, label: 'First Interview',   month: 'JUL 2026',  color: '#f472b6', desc: 'Phone screen done' },
  { id: 'm5',  x: 142, y: 478, label: 'Technical Round',   month: '',          color: '#fb7185', desc: 'Code test cleared' },
  { id: 'm6',  x: 338, y: 408, label: '50 Applications',   month: 'AUG 2026',  color: '#fb923c', desc: 'Building momentum' },
  { id: 'm7',  x: 142, y: 338, label: 'On-Site Interview', month: '',          color: '#facc15', desc: 'In person — nailed it' },
  { id: 'm8',  x: 332, y: 268, label: 'Final Round',       month: 'OCT 2026',  color: '#4ade80', desc: 'Last stretch' },
  { id: 'm9',  x: 148, y: 198, label: 'Offer Received',    month: '',          color: '#34d399', desc: 'The email arrived' },
  { id: 'm10', x: 322, y: 130, label: 'Negotiation Won',   month: 'NOV 2026',  color: '#22d3ee', desc: 'Better package' },
  { id: 'm11', x: 224, y: 62,  label: 'Dream Job!',        month: 'DEC 2026',  color: '#fbbf24', desc: 'New chapter begins' },
]

// Bezier road connecting each milestone (C = cubic bezier control points)
const ROAD_PATH = [
  'M 240 838',
  'C 212 818 138 798 148 762',
  'C 158 726 372 710 332 690',
  'C 292 670 108 652 142 618',
  'C 176 584 382 566 338 548',
  'C 294 530 108 510 142 478',
  'C 176 446 382 428 338 408',
  'C 294 388 108 368 142 338',
  'C 176 308 368 288 332 268',
  'C 296 248 118 226 148 198',
  'C 178 170 358 152 322 130',
  'C 286 108 200 84 224 62',
].join(' ')

// Tree positions [cx, cy, radius] — scattered along both road sides
const TREES = [
  // Bottom-left cluster (dense forest near start)
  [52,808,10],[37,822,12],[62,838,9],[42,852,11],[68,858,8],[30,845,10],
  // Mid-left
  [46,762,11],[32,778,9],[58,748,10],[38,735,8],
  [44,618,10],[30,632,12],[58,606,9],
  [48,478,11],[33,490,9],[62,466,10],
  [44,340,10],[30,354,11],[60,328,9],
  [46,198,11],[32,212,10],[62,185,9],
  // Bottom-right cluster
  [448,778,10],[462,792,12],[438,806,9],[468,818,8],[455,828,11],
  // Mid-right
  [452,694,10],[438,708,12],[466,682,9],
  [454,552,11],[440,566,9],[466,540,10],
  [452,412,10],[438,426,12],[466,400,9],
  [450,272,11],[436,284,9],[464,260,10],
  [448,134,10],[436,148,12],[462,122,9],
  // Extra scattered
  [28,580,8],[45,560,9],[55,700,8],[35,680,10],
  [458,480,8],[440,460,9],[462,360,8],[450,320,9],
]

// Pre-computed star opacity (avoid Math.random() on render)
const STARS = [
  [20,28,1.5,0.5],[75,48,1,0.4],[158,22,1.5,0.6],[318,14,1,0.35],[418,38,1.5,0.5],
  [14,118,1,0.3],[458,88,1.5,0.45],[28,198,1,0.4],[468,168,1,0.35],[18,278,1.5,0.5],
  [462,278,1,0.4],[20,398,1,0.35],[465,378,1.5,0.45],[16,488,1,0.3],[470,458,1,0.4],
  [22,598,1.5,0.5],[460,558,1,0.35],[18,698,1,0.4],[466,678,1.5,0.45],[26,788,1,0.3],
  [465,730,1.5,0.4],[12,340,1,0.35],[472,520,1,0.5],[24,440,1.5,0.4],[468,200,1,0.35],
]

export default function Journey() {
  const svgRef = useRef(null)
  const journeyMilestones    = useAppStore(s => s.journeyMilestones || [])
  const toggleJourneyMilestone = useAppStore(s => s.toggleJourneyMilestone)

  const completedCount  = journeyMilestones.length
  const nextUnlockedIdx = MILESTONES.findIndex(m => !journeyMilestones.includes(m.id))
  const progress        = Math.round((completedCount / MILESTONES.length) * 100)

  // Download as PNG via SVG→Canvas
  const handleSave = () => {
    const svg = svgRef.current
    if (!svg) return
    const xml   = new XMLSerializer().serializeToString(svg)
    const blob  = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url   = URL.createObjectURL(blob)
    const img   = new Image()
    img.onload  = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = 480
      canvas.height = 900
      canvas.getContext('2d').drawImage(img, 0, 0)
      const a       = document.createElement('a')
      a.download    = 'career-journey-2026.png'
      a.href        = canvas.toDataURL('image/png')
      a.click()
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      // Fallback: save raw SVG
      const a    = document.createElement('a')
      a.download = 'career-journey-2026.svg'
      a.href     = url
      a.click()
    }
    img.src = url
  }

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-950">Career Map</h1>
          <p className="text-sm text-rose-500 mt-1">{completedCount} / {MILESTONES.length} milestones · {progress}% of the journey</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 text-sm font-semibold bg-violet-100 text-violet-700 px-3 py-2 rounded-xl hover:bg-violet-200 transition-colors"
        >
          <Download size={14}/> Save PNG
        </button>
      </div>

      <p className="text-xs text-rose-400">Tap a milestone to mark it complete</p>

      {/* Progress bar */}
      <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
      </div>

      {/* Map — full size, page scrolls naturally */}
      <div className="rounded-3xl shadow-2xl border border-violet-900/30" style={{ overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 480 900"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%' }}
        >
          <defs>
            {/* Background gradient — night sky fading to dark ground */}
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#060d1a"/>
              <stop offset="45%"  stopColor="#0b1a0b"/>
              <stop offset="100%" stopColor="#0a1505"/>
            </linearGradient>

            {/* Glow filter for completed nodes */}
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softglow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Road gradient */}
            <linearGradient id="roadfill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#9a6d3a"/>
              <stop offset="50%"  stopColor="#c49060"/>
              <stop offset="100%" stopColor="#9a6d3a"/>
            </linearGradient>

            {/* Gold gradient for final node */}
            <radialGradient id="goldgrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fde68a"/>
              <stop offset="100%" stopColor="#f59e0b"/>
            </radialGradient>
          </defs>

          {/* ── Background ─────────────────────────────────────────── */}
          <rect width="480" height="900" fill="url(#bg)"/>

          {/* Ground texture patches */}
          <ellipse cx="100" cy="480" rx="130" ry="210" fill="#0d1f0d" opacity="0.55"/>
          <ellipse cx="385" cy="620" rx="110" ry="170" fill="#0d1f0d" opacity="0.45"/>
          <ellipse cx="210" cy="220" rx="150" ry="110" fill="#0a1a0a" opacity="0.45"/>
          <ellipse cx="340" cy="780" rx="90"  ry="110" fill="#0d1f0d" opacity="0.35"/>
          <ellipse cx="80"  cy="160" rx="80"  ry="70"  fill="#0a1508" opacity="0.35"/>

          {/* ── Stars ──────────────────────────────────────────────── */}
          {STARS.map(([cx, cy, r, op], i) => (
            <circle key={`s${i}`} cx={cx} cy={cy} r={r} fill="white" opacity={op}/>
          ))}

          {/* ── Mountains (upper-right corner) ─────────────────────── */}
          <polygon points="368,420 418,300 468,420" fill="#0f1e2e" opacity="0.85"/>
          <polygon points="398,358 452,228 478,358" fill="#131f2e" opacity="0.75"/>
          <polygon points="375,295 438,158 478,295" fill="#0e1a26" opacity="0.65"/>
          {/* Snow caps */}
          <polygon points="410,300 418,300 414,288" fill="#cbd5e1" opacity="0.55"/>
          <polygon points="443,228 452,228 447,214" fill="#e2e8f0" opacity="0.5"/>
          <polygon points="430,160 438,160 434,145" fill="#f1f5f9" opacity="0.45"/>

          {/* ── Small lake ─────────────────────────────────────────── */}
          <ellipse cx="416" cy="472" rx="26" ry="16" fill="#0e2a45" opacity="0.75"/>
          <ellipse cx="414" cy="469" rx="18" ry="10" fill="#0d3454" opacity="0.65"/>
          <ellipse cx="408" cy="465" rx="7"  ry="4"  fill="#1a4a70" opacity="0.45"/>

          {/* ── Trees ──────────────────────────────────────────────── */}
          {TREES.map(([cx, cy, r], i) => (
            <g key={`t${i}`}>
              <circle cx={cx}     cy={cy}     r={r + 3} fill="#082808" opacity="0.7"/>
              <circle cx={cx}     cy={cy - 2} r={r}     fill="#144a14" opacity="0.9"/>
              <circle cx={cx - 2} cy={cy + 3} r={r * 0.65} fill="#1a6a1a" opacity="0.7"/>
            </g>
          ))}

          {/* ── Road ───────────────────────────────────────────────── */}
          {/* Shadow / border */}
          <path d={ROAD_PATH} fill="none" stroke="#5a3c1a" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          {/* Main fill */}
          <path d={ROAD_PATH} fill="none" stroke="#b88650" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Lighter inner surface */}
          <path d={ROAD_PATH} fill="none" stroke="#d4a870" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          {/* Center dashes */}
          <path d={ROAD_PATH} fill="none" stroke="#f0d090" strokeWidth="2" strokeLinecap="round" strokeDasharray="14 18" opacity="0.65"/>

          {/* ── Month labels beside road ────────────────────────────── */}
          {MILESTONES.filter(m => m.month).map(m => (
            <text
              key={`ml-${m.id}`}
              x={m.x > 250 ? m.x - 108 : m.x + 72}
              y={m.y + 4}
              fontSize="8.5"
              fontFamily="system-ui,sans-serif"
              fontWeight="700"
              fill="#4a5568"
              textAnchor="middle"
              letterSpacing="1.5"
            >
              {m.month}
            </text>
          ))}

          {/* ── Title banner ─────────────────────────────────────────── */}
          <rect x="72" y="8" width="336" height="36" rx="10" fill="#0a0f1e" opacity="0.9"/>
          <rect x="72" y="8" width="336" height="36" rx="10" fill="none" stroke="#312e81" strokeWidth="1.5" opacity="0.8"/>
          <text x="240" y="31" fontSize="12.5" fontFamily="system-ui,sans-serif" fontWeight="900" fill="#e0e7ff" textAnchor="middle" letterSpacing="2.5">
            CAREER JOURNEY 2026
          </text>

          {/* ── Milestone nodes ─────────────────────────────────────── */}
          {MILESTONES.map((m, i) => {
            const done      = journeyMilestones.includes(m.id)
            const isCurrent = i === nextUnlockedIdx
            const isLast    = i === MILESTONES.length - 1
            const isFirst   = i === 0
            const nr        = isFirst || isLast ? 22 : 18   // node radius
            const isRight   = m.x > 250

            return (
              <g key={m.id} onClick={() => toggleJourneyMilestone(m.id)} cursor="pointer">

                {/* Outer glow for completed */}
                {done && (
                  <circle cx={m.x} cy={m.y} r={nr + 14} fill={m.color} opacity="0.18" filter="url(#glow)"/>
                )}
                {/* Pulse ring for current */}
                {isCurrent && !done && (
                  <>
                    <circle cx={m.x} cy={m.y} r={nr + 18} fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
                    <circle cx={m.x} cy={m.y} r={nr + 12} fill="none" stroke="white" strokeWidth="1.5" opacity="0.35"/>
                  </>
                )}

                {/* Node body */}
                <circle
                  cx={m.x} cy={m.y} r={nr + 3}
                  fill={done ? m.color : '#111827'}
                  stroke={done ? m.color : isCurrent ? '#f9fafb' : '#374151'}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  opacity={done ? 1 : isCurrent ? 0.95 : 0.6}
                  filter={done ? 'url(#softglow)' : undefined}
                />
                {/* Inner ring */}
                <circle
                  cx={m.x} cy={m.y} r={nr - 1}
                  fill={done ? `${m.color}88` : isLast ? '#1c1400' : '#0f172a'}
                  opacity="0.85"
                />

                {/* Icon inside node */}
                <text
                  x={m.x} y={m.y + 5}
                  fontSize={isFirst || isLast ? '14' : '11'}
                  fontFamily="system-ui,sans-serif"
                  fontWeight="900"
                  fill={done ? '#fff' : isCurrent ? '#fff' : '#4b5563'}
                  textAnchor="middle"
                >
                  {isLast ? (done ? '★' : '◆') : isFirst ? '◉' : done ? '✓' : String(i)}
                </text>

                {/* Milestone title label */}
                <text
                  x={isRight ? m.x - nr - 7 : m.x + nr + 7}
                  y={m.y - 6}
                  fontSize="9.5"
                  fontFamily="system-ui,sans-serif"
                  fontWeight="700"
                  fill={done ? '#f1f5f9' : isCurrent ? '#e2e8f0' : '#6b7280'}
                  textAnchor={isRight ? 'end' : 'start'}
                >
                  {m.label}
                </text>
                {/* Sub-label (desc) */}
                <text
                  x={isRight ? m.x - nr - 7 : m.x + nr + 7}
                  y={m.y + 7}
                  fontSize="8"
                  fontFamily="system-ui,sans-serif"
                  fill={done ? `${m.color}cc` : isCurrent ? '#9ca3af' : '#374151'}
                  textAnchor={isRight ? 'end' : 'start'}
                >
                  {m.desc}
                </text>

                {/* "YOU ARE HERE" tag on current */}
                {isCurrent && !done && (
                  <>
                    <rect
                      x={isRight ? m.x - nr - 72 : m.x + nr + 6}
                      y={m.y + 14}
                      width="66" height="13" rx="4"
                      fill="#7c3aed" opacity="0.9"
                    />
                    <text
                      x={isRight ? m.x - nr - 39 : m.x + nr + 39}
                      y={m.y + 24}
                      fontSize="7.5"
                      fontFamily="system-ui,sans-serif"
                      fontWeight="700"
                      fill="white"
                      textAnchor="middle"
                      letterSpacing="0.5"
                    >
                      YOU ARE HERE
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* ── Progress footer ─────────────────────────────────────── */}
          <rect x="0" y="874" width="480" height="26" fill="#060c18" opacity="0.95"/>
          <rect x="12" y="880" width="456" height="10" rx="5" fill="#1e293b"/>
          <rect
            x="12" y="880"
            width={Math.round(456 * completedCount / MILESTONES.length)} height="10" rx="5"
            fill="#7c3aed" opacity="0.9"
          />
          {completedCount > 0 && (
            <rect
              x="12" y="880"
              width={Math.round(456 * completedCount / MILESTONES.length)} height="10" rx="5"
              fill="url(#goldgrad)" opacity="0.5"
            />
          )}
          <text x="240" y="890" fontSize="8" fontFamily="system-ui,sans-serif" fill="#94a3b8" textAnchor="middle" letterSpacing="1">
            {`${completedCount} / ${MILESTONES.length} MILESTONES COMPLETED`}
          </text>
        </svg>
      </div>

      {/* Milestone list below map */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">All milestones</p>
        {MILESTONES.map((m, i) => {
          const done = journeyMilestones.includes(m.id)
          return (
            <button
              key={m.id}
              onClick={() => toggleJourneyMilestone(m.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all ${
                done ? 'bg-white/80 border border-green-200/60' : 'bg-white/40 border border-pink-100/40 hover:bg-white/60'
              }`}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{ background: done ? m.color : '#e2e8f0', color: done ? '#fff' : '#94a3b8' }}
              >
                {done ? '✓' : i}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold leading-tight ${done ? 'text-rose-900' : 'text-rose-400 line-through'}`}>{m.label}</p>
                <p className="text-xs text-rose-300">{m.desc}{m.month ? ` · ${m.month}` : ''}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

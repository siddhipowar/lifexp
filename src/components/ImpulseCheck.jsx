import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { callClaudeJSON } from '../lib/claude'
import { IMPULSE_SYSTEM } from '../lib/prompts'
import { X, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react'

const VERDICT_CONFIG = {
  PAUSE: {
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700 border-red-300',
    icon: '🛑',
    label: 'PAUSE — Don\'t do this',
  },
  REFLECT: {
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: '⏸️',
    label: 'REFLECT — Think harder first',
  },
  PROCEED: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: '✅',
    label: 'PROCEED — This is fine',
  },
}

function ImpulseResult({ result }) {
  const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.REFLECT
  return (
    <div className={`rounded-3xl border p-5 space-y-4 ${cfg.bg}`}>
      {/* Verdict badge */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{cfg.icon}</span>
        <div>
          <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.label}
          </span>
          <p className={`text-sm font-semibold mt-1.5 ${cfg.color}`}>{result.verdictReason}</p>
        </div>
      </div>

      {/* What you really want */}
      <div className="bg-white/70 rounded-2xl p-4">
        <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">What you really want</p>
        <p className="text-sm text-rose-800">{result.whatYouReallyWant}</p>
      </div>

      {/* Short vs long term */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/70 rounded-2xl p-3">
          <p className="text-xs font-bold text-pink-500 mb-1">Right now</p>
          <p className="text-xs text-rose-700">{result.shortTermConsequence}</p>
        </div>
        <div className="bg-white/70 rounded-2xl p-3">
          <p className="text-xs font-bold text-purple-500 mb-1">One month from now</p>
          <p className="text-xs text-rose-700">{result.longTermConsequence}</p>
        </div>
      </div>

      {/* Anchor alignment */}
      {result.anchorNote && (
        <div className="bg-white/70 rounded-2xl p-3 flex items-start gap-2">
          <span className="text-base mt-0.5">{result.alignsWithAnchors ? '✨' : '⚠️'}</span>
          <div>
            <p className="text-xs font-bold text-purple-600 mb-0.5">Identity check</p>
            <p className="text-xs text-rose-700">{result.anchorNote}</p>
          </div>
        </div>
      )}

      {/* Pattern note */}
      {result.patternNote && (
        <div className="bg-white/70 rounded-2xl p-3 flex items-start gap-2">
          <span className="text-base mt-0.5">🔍</span>
          <div>
            <p className="text-xs font-bold text-rose-600 mb-0.5">Pattern I'm noticing</p>
            <p className="text-xs text-rose-700">{result.patternNote}</p>
          </div>
        </div>
      )}

      {/* One action */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 border border-pink-200">
        <p className="text-xs font-black text-pink-600 uppercase tracking-wider mb-1">Do this right now instead</p>
        <p className="text-sm font-semibold text-rose-900">{result.oneAction}</p>
      </div>
    </div>
  )
}

function HistoryItem({ check }) {
  const [open, setOpen] = useState(false)
  const cfg = VERDICT_CONFIG[check.result?.verdict] || VERDICT_CONFIG.REFLECT
  const date = new Date(check.timestamp)
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="card p-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <p className="text-sm text-rose-800 truncate">{check.impulse}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-rose-400">{label}</span>
            {open ? <ChevronUp size={14} className="text-rose-300" /> : <ChevronDown size={14} className="text-rose-300" />}
          </div>
        </div>
      </button>
      {open && check.result && (
        <div className="mt-3 animate-fade-in">
          <ImpulseResult result={check.result} />
        </div>
      )}
    </div>
  )
}

export default function ImpulseCheck({ onClose }) {
  const user = useAppStore((s) => s.user)
  const impulseChecks = useAppStore((s) => s.impulseChecks)
  const addImpulseCheck = useAppStore((s) => s.addImpulseCheck)

  const [impulse, setImpulse] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [view, setView] = useState('check') // 'check' | 'history'
  const [error, setError] = useState(null)

  const handleCheck = async () => {
    if (!impulse.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await callClaudeJSON({
        system: IMPULSE_SYSTEM(user),
        messages: [{ role: 'user', content: `My impulse: ${impulse}` }],
        maxTokens: 600,
      })
      setResult(data)
      addImpulseCheck({ impulse: impulse.trim(), result: data })
    } catch (e) {
      setError('Could not reach the AI guide. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImpulse('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="font-display text-lg font-bold text-rose-950">Impulse Check</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'check' ? 'history' : 'check')}
              className="text-xs text-purple-500 font-semibold hover:text-purple-700 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors"
            >
              {view === 'check' ? `History (${impulseChecks.length})` : '← Check'}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-pink-50 text-rose-400 hover:text-rose-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 pb-5">
          {view === 'history' ? (
            <div className="space-y-3">
              {impulseChecks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">🧘</p>
                  <p className="text-sm text-rose-500">No impulse checks yet.</p>
                  <p className="text-xs text-rose-400 mt-1">When you pause before acting, it shows up here.</p>
                </div>
              ) : (
                impulseChecks.map(c => <HistoryItem key={c.id} check={c} />)
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!result ? (
                <>
                  <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                    <p className="text-xs text-rose-600 leading-relaxed">
                      You're about to do something. Describe it honestly — what are you thinking of doing, saying, or sending?
                    </p>
                  </div>
                  <textarea
                    className="textarea-cozy w-full min-h-[120px] resize-none"
                    placeholder="e.g. I want to text my ex. / I'm about to quit my job in an email. / I'm thinking of confronting my coworker right now..."
                    value={impulse}
                    onChange={e => setImpulse(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
                  <button
                    onClick={handleCheck}
                    disabled={!impulse.trim() || loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin text-base">⟳</span>
                        Checking impulse...
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} />
                        Check this impulse
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-pink-50 rounded-2xl px-4 py-2 border border-pink-100">
                    <p className="text-xs text-rose-500 italic">"{impulse}"</p>
                  </div>
                  <ImpulseResult result={result} />
                  <button
                    onClick={reset}
                    className="btn-ghost w-full text-sm"
                  >
                    Check another impulse
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { callClaudeJSON } from '../lib/claude'
import { MASTER_DOCUMENT_SYSTEM } from '../lib/prompts'
import { Sparkles, Loader, Check, AlertCircle } from 'lucide-react'

export default function MasterDocument() {
  const user = useAppStore((s) => s.user)
  const updateMasterDocument = useAppStore((s) => s.updateMasterDocument)
  const setQuests = useAppStore((s) => s.setQuests)
  const setHabits = useAppStore((s) => s.setHabits)
  const quests = useAppStore((s) => s.quests)
  const habits = useAppStore((s) => s.habits)

  const [text, setText] = useState(user.masterDocument || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [approved, setApproved] = useState(false)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setApproved(false)
    updateMasterDocument(text)

    try {
      const data = await callClaudeJSON({
        system: MASTER_DOCUMENT_SYSTEM,
        messages: [{ role: 'user', content: text }],
        maxTokens: 2000,
      })
      setResult(data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleApprove = () => {
    if (!result) return
    const existingActive = quests.filter(q => !q.completed)
    const newQuests = result.quests.map(q => ({ ...q, completed: false }))
    if (result.soulQuest) {
      newQuests.push({
        id: 'soul_' + Date.now(),
        title: result.soulQuest.title,
        category: 'soul',
        xp: result.soulQuest.xp || 50,
        coins: result.soulQuest.coins || 5,
        priority: 1,
        estimatedMinutes: 20,
        scheduledDay: 'today',
        parentGoal: 'Soul work',
        tip: result.soulQuest.description,
        completed: false,
      })
    }
    // Merge: keep all existing quests, add only new ones not already present by title
    const existingTitles = new Set(quests.map(q => q.title.toLowerCase()))
    const dedupedNew = newQuests.filter(q => !existingTitles.has(q.title.toLowerCase()))
    setQuests([...quests, ...dedupedNew])
    if (result.habits?.length) {
      setHabits([...habits, ...result.habits.map(h => ({
        ...h,
        id: Date.now().toString() + Math.random(),
        currentStreak: 0,
        longestStreak: 0,
        completedDates: [],
      }))])
    }
    setApproved(true)
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="font-display text-3xl font-bold text-rose-950">My Life</h1>
        <p className="text-sm text-rose-500 mt-1">Dump everything here. The AI will organize it into quests.</p>
      </div>

      {/* Master document textarea */}
      <div className="card p-5">
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">Brain dump — pour it all out ✨</p>
        <textarea
          rows={12}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Everything on your mind — no filter needed.

For example:
- Apply to Waymo, Applied Intuition, Zoox this week
- Fix the CARLA pipeline unit conversion bug
- Call mom more often
- Stop skipping the gym
- Finish LeetCode Blind 75 by end of June
- Need to stop texting my ex when I feel empty
- Read 1 book per month
- Feel like I'm losing track of who I am

The AI will read all of this and turn it into a real plan.`}
          className="textarea-cozy text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-rose-400">{text.split('\n').filter(l => l.trim()).length} items</p>
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <><Loader size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles size={16} /> Let AI Take Over</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p>{error}</p>
            <p className="text-xs mt-1 text-red-500">Make sure the API proxy is running (see README).</p>
          </div>
        </div>
      )}

      {/* AI Result */}
      {result && !approved && (
        <div className="space-y-4 animate-slide-up">
          {/* Assessment */}
          <div className="bg-soul-gradient rounded-3xl p-6 border border-purple-100">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">AI Assessment</p>
            <p className="text-sm text-purple-900 leading-relaxed mb-4">{result.assessment?.summary}</p>

            {result.assessment?.overloaded && (
              <div className="bg-white/60 rounded-2xl p-3 mb-3 border border-pink-200">
                <p className="text-xs font-bold text-pink-600 mb-1">⚠️ You're trying to do too much.</p>
                <p className="text-xs text-pink-700">This week, focus only on:</p>
                <ul className="mt-1">
                  {result.assessment.weekFocus?.map((item, i) => (
                    <li key={i} className="text-xs text-pink-800 font-medium">✦ {item}</li>
                  ))}
                </ul>
                {result.assessment.defer?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-rose-500">Defer for now:</p>
                    {result.assessment.defer.map((item, i) => (
                      <p key={i} className="text-xs text-rose-400 line-through">{item}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-sm font-bold text-purple-800 italic">✨ "{result.assessment?.encouragement}"</p>
          </div>

          {/* Soul Quest */}
          {result.soulQuest && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-5 border border-purple-200">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Daily Soul Quest</p>
              <p className="text-sm font-bold text-purple-900">{result.soulQuest.title}</p>
              <p className="text-xs text-purple-700 mt-1">{result.soulQuest.description}</p>
              <p className="text-xs text-purple-400 mt-1">+{result.soulQuest.xp} XP · +{result.soulQuest.coins || 5} 🪙</p>
            </div>
          )}

          {/* Generated quests preview */}
          <div className="card p-5">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">{result.quests?.length} quests generated</p>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-cozy">
              {result.quests?.map((q, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-pink-50 last:border-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: q.priority === 1 ? '#f43f5e' : q.priority === 2 ? '#f97316' : '#86efac' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-rose-900 truncate">{q.title}</p>
                    <p className="text-xs text-rose-400">{q.category} · {q.estimatedMinutes}m</p>
                  </div>
                  <span className="text-xs text-purple-500 flex-shrink-0">+{q.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Habits */}
          {result.habits?.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">{result.habits.length} habits to build</p>
              <div className="flex flex-wrap gap-2">
                {result.habits.map((h, i) => (
                  <span key={i} className="text-xs bg-pink-50 text-pink-700 border border-pink-100 rounded-full px-3 py-1.5">
                    {h.emoji} {h.name} (+{h.xp} XP)
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleApprove} className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
            <Check size={18} />
            Looks good — add to Quest Board ✨
          </button>
        </div>
      )}

      {approved && (
        <div className="card p-6 text-center animate-pop">
          <div className="text-4xl mb-3 animate-sparkle">🎉</div>
          <p className="font-display text-xl font-bold text-rose-900">Quests added!</p>
          <p className="text-sm text-rose-500 mt-1">Check your Quest Board and Dashboard to get started.</p>
        </div>
      )}
    </div>
  )
}

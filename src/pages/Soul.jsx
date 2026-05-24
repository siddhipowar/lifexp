import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Plus, Heart, Minus, BookOpen, TrendingUp, Shield } from 'lucide-react'
import { callClaudeJSON } from '../lib/claude'
import { SOUL_REFLECTION_SYSTEM } from '../lib/prompts'

export default function Soul() {
  const user = useAppStore((s) => s.user)
  const soulEntries = useAppStore((s) => s.soulEntries)
  const quests = useAppStore((s) => s.quests)
  const addSoulEntry = useAppStore((s) => s.addSoulEntry)
  const updateIdentityAnchors = useAppStore((s) => s.updateIdentityAnchors)
  const addQuest = useAppStore((s) => s.addQuest)

  const [activeTab, setActiveTab] = useState('anchors')
  const [newAnchor, setNewAnchor] = useState('')
  const [todayScore, setTodayScore] = useState(null)
  const [depLog, setDepLog] = useState('')
  const [logSubmitting, setLogSubmitting] = useState(false)
  const [reflection, setReflection] = useState(null)
  const [reflecting, setReflecting] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayEntry = soulEntries.find(e => e.date === today)
  const recentEntries = soulEntries.slice(-14)
  const soulQuests = quests.filter(q => q.category === 'soul')

  // Check if below threshold for 3 days
  const last3 = soulEntries.slice(-3)
  const lowEnergy = last3.length >= 3 && last3.every(e => e.selfInvestmentScore <= 2)

  const addAnchor = () => {
    if (!newAnchor.trim()) return
    updateIdentityAnchors([...user.identityAnchors, newAnchor.trim()])
    setNewAnchor('')
  }

  const removeAnchor = (i) => {
    updateIdentityAnchors(user.identityAnchors.filter((_, idx) => idx !== i))
  }

  const submitEntry = () => {
    if (!todayScore) return
    addSoulEntry({ selfInvestmentScore: todayScore, dependencyLog: depLog || null, soulQuestCompleted: soulQuests.some(q => q.completed) })
    setLogSubmitting(true)
    setTimeout(() => setLogSubmitting(false), 500)
    setDepLog('')
    setTodayScore(null)
  }

  const getWeeklyReflection = async () => {
    setReflecting(true)
    try {
      const entries = soulEntries.slice(-7).map(e => `${e.date}: score=${e.selfInvestmentScore}${e.dependencyLog ? ', note="' + e.dependencyLog + '"' : ''}`).join('\n')
      const result = await callClaudeJSON({
        system: SOUL_REFLECTION_SYSTEM,
        messages: [{ role: 'user', content: `My soul entries this week:\n${entries || 'No entries yet.'}` }],
        maxTokens: 600,
      })
      setReflection(result)
      if (result.soulQuests?.length) {
        result.soulQuests.forEach(q => addQuest({
          id: 'soul_' + Date.now() + Math.random(),
          title: q.title,
          category: 'soul',
          xp: q.xp || 50,
          coins: q.coins || 5,
          priority: 1,
          estimatedMinutes: 20,
          scheduledDay: 'this_week',
          parentGoal: 'Weekly soul work',
          tip: 'Generated from your weekly reflection',
          completed: false,
        }))
      }
    } catch (e) {
      console.error(e)
    }
    setReflecting(false)
  }

  const TABS = [
    { id: 'anchors', label: '🪞 Anchors', icon: Shield },
    { id: 'meter', label: '⚖️ Balance', icon: TrendingUp },
    { id: 'tracker', label: '📓 Patterns', icon: BookOpen },
    { id: 'quests', label: '✨ Quests', icon: Heart },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="font-display text-3xl font-bold text-rose-950">Soul System</h1>
        <p className="text-sm text-purple-600 mt-1 italic">"You are not someone's emotional support animal. You are a main character."</p>
      </div>

      {/* Low energy nudge */}
      {lowEnergy && (
        <div className="bg-soul-gradient rounded-3xl p-5 border border-purple-200 animate-pulse-soft">
          <p className="text-sm font-bold text-purple-800 mb-1">💜 Hey — I noticed something.</p>
          <p className="text-sm text-purple-700">Your self-investment has been low for 3 days in a row. Today's soul quest: do one thing that is <em>purely yours</em>.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-sm'
                : 'bg-white/70 text-purple-700 hover:bg-purple-50 border border-purple-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Identity Anchors */}
      {activeTab === 'anchors' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-soul-gradient rounded-3xl p-6 border border-purple-100">
            <h2 className="font-display text-xl font-bold text-purple-900 mb-2">Identity Anchors</h2>
            <p className="text-sm text-purple-700 mb-5">Who are you, outside of any relationship? These are your constants. Your north star. When you start losing yourself — come back here.</p>

            {user.identityAnchors?.length > 0 ? (
              <div className="space-y-2 mb-4">
                {user.identityAnchors.map((anchor, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/60 rounded-2xl px-4 py-3 group">
                    <span className="text-purple-400">✦</span>
                    <span className="flex-1 text-sm text-purple-900 font-medium">{anchor}</span>
                    <button onClick={() => removeAnchor(i)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all p-1">
                      <Minus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-purple-500 italic mb-4">No anchors yet. Define who you are.</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newAnchor}
                onChange={e => setNewAnchor(e.target.value)}
                placeholder="Add an anchor... (e.g. 'LiDAR engineer who ships things')"
                className="textarea-cozy flex-1 text-sm py-2"
                onKeyDown={e => e.key === 'Enter' && addAnchor()}
              />
              <button onClick={addAnchor} className="btn-soul text-sm px-4 py-2 flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Suggested anchors if none yet */}
          {user.identityAnchors?.length === 0 && (
            <div className="card p-4">
              <p className="text-xs font-bold text-pink-400 mb-3">✨ Quick start — tap to add:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'LiDAR software engineer', 'Builder who ships things', 'Someone with a curious mind',
                  'Person who shows up for herself', 'Engineer with production experience',
                  'Someone navigating her path intentionally'
                ].map(s => (
                  <button key={s} onClick={() => updateIdentityAnchors([...user.identityAnchors, s])}
                    className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-all">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bond Balance Meter */}
      {activeTab === 'meter' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-rose-950 mb-1">Bond Balance Meter</h2>
            <p className="text-sm text-rose-500 mb-5">How much energy went to yourself vs. one person today?</p>

            {!todayEntry ? (
              <div>
                <p className="text-sm font-semibold text-rose-700 mb-4">Today I invested in myself:</p>
                <div className="flex gap-3 justify-between mb-6">
                  {[
                    { v: 1, emoji: '😶', label: 'Almost none' },
                    { v: 2, emoji: '😔', label: 'A little' },
                    { v: 3, emoji: '🙂', label: 'Some' },
                    { v: 4, emoji: '😊', label: 'A lot' },
                    { v: 5, emoji: '✨', label: 'Fully me' },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setTodayScore(opt.v)}
                      className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl transition-all ${
                        todayScore === opt.v ? 'bg-gradient-to-br from-purple-100 to-pink-100 ring-2 ring-purple-300' : 'hover:bg-purple-50'
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-xs text-purple-600">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-rose-500 mb-2">Optional — what happened? (pattern tracking)</p>
                  <textarea
                    value={depLog}
                    onChange={e => setDepLog(e.target.value)}
                    placeholder="e.g. 'I canceled the gym for them again' or 'I did 2 hours on my project and it felt amazing'"
                    className="textarea-cozy text-sm"
                    rows={3}
                  />
                </div>

                <button onClick={submitEntry} disabled={!todayScore} className="btn-soul w-full">
                  Log today ✨
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">
                  {['😶','😔','🙂','😊','✨'][todayEntry.selfInvestmentScore - 1]}
                </p>
                <p className="font-semibold text-rose-700">Today logged ✓</p>
                <p className="text-sm text-rose-500">Score: {todayEntry.selfInvestmentScore}/5</p>
                {todayEntry.dependencyLog && (
                  <p className="text-xs text-purple-600 mt-2 italic">"{todayEntry.dependencyLog}"</p>
                )}
              </div>
            )}
          </div>

          {/* Chart */}
          {recentEntries.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-bold text-rose-500 mb-4 uppercase tracking-wider">Your trend (last {recentEntries.length} entries)</p>
              <div className="flex items-end gap-1.5 h-20">
                {recentEntries.map((e, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-pink-400 to-purple-500 transition-all"
                      style={{ height: `${(e.selfInvestmentScore / 5) * 100}%` }}
                    />
                    <span className="text-[8px] text-rose-300 rotate-45 whitespace-nowrap">{e.date.slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-rose-400">
                <span>avg: {(recentEntries.reduce((s, e) => s + e.selfInvestmentScore, 0) / recentEntries.length).toFixed(1)}/5</span>
                <button onClick={getWeeklyReflection} disabled={reflecting} className="text-purple-500 hover:text-purple-700 font-semibold">
                  {reflecting ? 'Reflecting...' : '✨ Get weekly reflection'}
                </button>
              </div>
            </div>
          )}

          {reflection && (
            <div className="bg-soul-gradient rounded-3xl p-5 border border-purple-100 animate-slide-up">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">AI Weekly Reflection</p>
              <p className="text-sm text-purple-900 leading-relaxed mb-3">{reflection.weekSummary}</p>
              {reflection.patterns?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-purple-600 mb-1">Patterns I noticed:</p>
                  {reflection.patterns.map((p, i) => <p key={i} className="text-xs text-purple-700 mb-0.5">• {p}</p>)}
                </div>
              )}
              {reflection.wins?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-green-600 mb-1">✓ Wins:</p>
                  {reflection.wins.map((w, i) => <p key={i} className="text-xs text-green-700 mb-0.5">• {w}</p>)}
                </div>
              )}
              <p className="text-sm font-semibold text-purple-800 bg-white/60 rounded-2xl p-3 mt-2">💜 {reflection.nudge}</p>
            </div>
          )}
        </div>
      )}

      {/* Pattern Tracker */}
      {activeTab === 'tracker' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h2 className="font-display text-xl font-bold text-rose-950 mb-2">Pattern Tracker</h2>
            <p className="text-sm text-rose-500 mb-4">Log moments when you put someone else's emotional needs above your own goals. No judgment — just data.</p>

            <div className="space-y-2 mb-4">
              {soulEntries.filter(e => e.dependencyLog).slice(-10).reverse().map((e, i) => (
                <div key={i} className="bg-pink-50 rounded-2xl p-3 border border-pink-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-rose-700">{e.date}</span>
                    <span className="text-xs text-purple-500">Self: {e.selfInvestmentScore}/5</span>
                  </div>
                  <p className="text-sm text-rose-700 italic">"{e.dependencyLog}"</p>
                </div>
              ))}
              {soulEntries.filter(e => e.dependencyLog).length === 0 && (
                <p className="text-sm text-rose-400 italic">No patterns logged yet. Log daily to see trends.</p>
              )}
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <p className="text-xs font-bold text-purple-600 mb-2">Common patterns to watch for:</p>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Canceling plans/workouts/applications for someone</li>
                <li>• Checking their social media when you're supposed to be focused</li>
                <li>• Texting them when you feel empty instead of doing something for yourself</li>
                <li>• Changing your plans based on their mood</li>
                <li>• Feeling proud only when they validate you</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Soul Quests */}
      {activeTab === 'quests' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h2 className="font-display text-xl font-bold text-rose-950 mb-4">Daily Soul Quests</h2>

            {soulQuests.length > 0 ? (
              <div className="space-y-3">
                {soulQuests.map(q => (
                  <div key={q.id} className={`bg-soul-gradient rounded-2xl p-4 border border-purple-100 ${q.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold text-purple-900 ${q.completed ? 'line-through' : ''}`}>{q.title}</p>
                      <span className="text-xs text-purple-400">+{q.xp} XP</span>
                    </div>
                    {q.tip && <p className="text-xs text-purple-700 italic">{q.tip}</p>}
                    {!q.completed && (
                      <button onClick={() => {
                        const { completeQuest } = useAppStore.getState()
                        completeQuest(q.id)
                      }} className="mt-2 text-xs btn-soul py-1.5 px-3">
                        Complete ✨
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-rose-400 text-sm">No soul quests yet.</p>
                <p className="text-xs text-rose-300 mt-1">Run the Master Document to generate them.</p>
              </div>
            )}

            {/* Suggested quick soul quests */}
            <div className="mt-6">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Quick add a soul quest:</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { title: 'Do one thing today that has nothing to do with anyone else', xp: 50 },
                  { title: 'Spend 30 min on your side project without checking your phone', xp: 60 },
                  { title: 'Write 3 things you love about yourself that no relationship can give you', xp: 40 },
                  { title: 'Reach out to a friend (not your dependency target) today', xp: 50 },
                ].map(sq => (
                  <button
                    key={sq.title}
                    onClick={() => addQuest({ id: 'soul_' + Date.now(), title: sq.title, category: 'soul', xp: sq.xp, coins: 5, priority: 1, estimatedMinutes: 20, scheduledDay: 'today', parentGoal: 'Soul work', tip: 'Your independence is your superpower.', completed: false })}
                    className="text-left text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 rounded-2xl px-4 py-2.5 transition-all"
                  >
                    + {sq.title} <span className="text-purple-400">(+{sq.xp} XP)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

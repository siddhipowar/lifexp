import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestCard from '../components/QuestCard'
import XPBar from '../components/XPBar'
import { Zap, Heart, Flame, ArrowRight } from 'lucide-react'

const MOODS = [
  { value: 1, emoji: '😴', label: 'Drained' },
  { value: 2, emoji: '😔', label: 'Low' },
  { value: 3, emoji: '😊', label: 'Okay' },
  { value: 4, emoji: '✨', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'On fire' },
]

function getLevelTitle(level) {
  if (level <= 3) return 'Signal Apprentice'
  if (level <= 6) return 'LiDAR Ranger'
  if (level <= 10) return 'Sensor Mage'
  if (level <= 15) return 'Quantum Engineer'
  return 'Architect of Worlds'
}

export default function Dashboard() {
  const user = useAppStore((s) => s.user)
  const quests = useAppStore((s) => s.quests)
  const habits = useAppStore((s) => s.habits)
  const setMoodToday = useAppStore((s) => s.setMoodToday)
  const xpNeeded = useAppStore((s) => s.xpNeeded)()
  const navigate = useNavigate()
  const [justOneMode, setJustOneMode] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const hasMoodToday = user.lastMoodDate === today
  const activeQuests = quests.filter(q => !q.completed)
  const soulQuest = activeQuests.find(q => q.category === 'soul')
  const priorityQuests = activeQuests.filter(q => q.category !== 'soul').sort((a, b) => a.priority - b.priority).slice(0, 3)
  const justOne = activeQuests.sort((a, b) => a.priority - b.priority)[0]
  const completedToday = quests.filter(q => q.completed && q.completedAt?.startsWith(today)).length
  const habitsToday = habits.filter(h => h.completedDates?.includes(today)).length

  const xpPct = Math.round((user.xp / xpNeeded) * 100)

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Header */}
      <div>
        <p className="text-pink-400 text-sm font-semibold">
          {getGreeting()}, {user.name?.split(' ')[0]} ✨
        </p>
        <h1 className="font-display text-3xl font-bold text-rose-950 leading-tight">
          {hasMoodToday ? 'Ready for your quests?' : 'How are you feeling today?'}
        </h1>
      </div>

      {/* Character card */}
      <div className="card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-glow-purple">
              {user.name?.[0] || 'S'}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-xl font-bold text-rose-950">{user.name}</h2>
                <span className="text-xs text-purple-500 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">Lv {user.level}</span>
              </div>
              <p className="text-xs text-rose-500">{getLevelTitle(user.level)} · {user.avatarClass}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-amber-500">🪙 {user.coins}</p>
              <p className="text-xs text-rose-400">coins</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-1">
            <XPBar xp={user.xp} needed={xpNeeded} />
          </div>
          <div className="flex justify-between text-xs text-rose-400">
            <span>{user.xp} / {xpNeeded} XP</span>
            <span>{xpPct}% to Level {user.level + 1}</span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/60 rounded-2xl p-2.5 text-center">
              <p className="text-lg font-black text-pink-500">{completedToday}</p>
              <p className="text-xs text-rose-400">done today</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-2.5 text-center">
              <p className="text-lg font-black text-purple-500">{activeQuests.length}</p>
              <p className="text-xs text-rose-400">active quests</p>
            </div>
            <div className="bg-white/60 rounded-2xl p-2.5 text-center">
              <p className="text-lg font-black text-amber-500">{habitsToday}</p>
              <p className="text-xs text-rose-400">habits done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mood check-in */}
      {!hasMoodToday && (
        <div className="card p-5 animate-slide-up">
          <p className="text-sm font-semibold text-rose-900 mb-4">Quick check-in — how's your energy?</p>
          <div className="flex gap-2 justify-between">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMoodToday(m.value)}
                className="flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl hover:bg-pink-50 transition-all hover:scale-105"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs text-rose-500">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {hasMoodToday && user.moodToday && (
        <div className="flex items-center gap-2 bg-pink-50 rounded-2xl px-4 py-2 border border-pink-100">
          <span className="text-lg">{MOODS.find(m => m.value === user.moodToday)?.emoji}</span>
          <span className="text-sm text-rose-700">
            Today's energy: <strong>{MOODS.find(m => m.value === user.moodToday)?.label}</strong>
            {user.moodToday <= 2 && ' — I moved your harder quests to tomorrow. Just one thing today.'}
          </span>
        </div>
      )}

      {/* Just One Thing mode */}
      {activeQuests.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-rose-700">
            {justOneMode ? "✨ Just this one thing:" : "Today's focus"}
          </p>
          <button
            onClick={() => setJustOneMode(!justOneMode)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${justOneMode ? 'bg-purple-100 text-purple-600' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'}`}
          >
            {justOneMode ? 'Show all' : '😵 Overwhelmed? Just 1 thing'}
          </button>
        </div>
      )}

      {/* Soul Quest — always first */}
      {soulQuest && !justOneMode && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={14} className="text-purple-500" />
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Daily Soul Quest</p>
          </div>
          <QuestCard quest={soulQuest} />
        </div>
      )}

      {/* Today's quests or Just One */}
      {justOneMode && justOne ? (
        <QuestCard quest={justOne} />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-pink-500" />
              <p className="text-xs font-bold text-pink-500 uppercase tracking-wider">Top quests today</p>
            </div>
            <button onClick={() => navigate('/app/quests')} className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {priorityQuests.length > 0 ? (
            <div className="space-y-3">
              {priorityQuests.map(q => <QuestCard key={q.id} quest={q} />)}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-semibold text-rose-700">All caught up!</p>
              <p className="text-xs text-rose-400 mt-1">Add more from the Master Document</p>
              <button onClick={() => navigate('/app/my-life')} className="btn-ghost text-xs px-4 py-2 mt-3">
                Open My Life
              </button>
            </div>
          )}
        </div>
      )}

      {/* Identity anchors */}
      {user.identityAnchors?.length > 0 && (
        <div className="bg-soul-gradient rounded-3xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-400 text-sm">✨</span>
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Who you are</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.identityAnchors.map((anchor, i) => (
              <span key={i} className="text-xs bg-white/70 text-purple-800 px-3 py-1.5 rounded-full border border-purple-100 font-medium">
                {anchor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

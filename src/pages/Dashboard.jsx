import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestCard from '../components/QuestCard'
import XPBar from '../components/XPBar'
import Avatar3D from '../components/Avatar3D'
import { Zap, Heart, Flame, ArrowRight, Clock } from 'lucide-react'
import { getLevelTitle } from '../lib/levelTitle'

const MOODS = [
  { value: 1, emoji: '😴', label: 'Drained' },
  { value: 2, emoji: '😔', label: 'Low' },
  { value: 3, emoji: '😊', label: 'Okay' },
  { value: 4, emoji: '✨', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'On fire' },
]


export default function Dashboard() {
  const user = useAppStore((s) => s.user)
  const quests = useAppStore((s) => s.quests)
  const habits = useAppStore((s) => s.habits)
  const setMoodToday = useAppStore((s) => s.setMoodToday)
  const xpNeeded = useAppStore((s) => s.xpNeeded)()
  const navigate = useNavigate()
  const [justOneMode, setJustOneMode] = useState(false)

  const dailySummaries = useAppStore((s) => s.dailySummaries)
  const today = new Date().toISOString().split('T')[0]
  const hasMoodToday = user.lastMoodDate === today
  const activeQuests = quests.filter(q => !q.completed)
  const soulQuest = activeQuests.find(q => q.category === 'soul')
  const priorityQuests = activeQuests.filter(q => q.category !== 'soul').sort((a, b) => a.priority - b.priority).slice(0, 3)
  const justOne = activeQuests.sort((a, b) => a.priority - b.priority)[0]
  const completedToday = quests.filter(q => q.completed && q.completedAt?.startsWith(today)).length
  const habitsToday = habits.filter(h => h.completedDates?.includes(today)).length
  const totalTodayQuests = completedToday + activeQuests.filter(q => q.scheduledDay === 'today').length

  // Mood score 0–100 driving the avatar
  const questScore   = totalTodayQuests > 0 ? (completedToday / totalTodayQuests) * 40 : 20
  const habitScore   = habits.length > 0 ? (habitsToday / habits.length) * 30 : 15
  const moodScore    = user.moodToday ? ((user.moodToday - 1) / 4) * 20 : 10
  const soulScore    = (() => {
    const todaySoul = dailySummaries[0]?.date === today ? 10 : 0
    const soulDone  = quests.filter(q => q.category === 'soul' && q.completed && q.completedAt?.startsWith(today)).length
    return soulDone > 0 ? 10 : 5
  })()
  const avatarScore  = Math.round(questScore + habitScore + moodScore + soulScore)

  // Yesterday's summary
  const yesterdaySummary = dailySummaries[0]

  const xpPct = Math.round((user.xp / xpNeeded) * 100)

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Header */}
      <div>
        <p className="text-pink-400 text-sm font-semibold tracking-wide">
          {getGreeting()}, {user.name?.split(' ')[0]}
        </p>
        <h1 className="font-display text-3xl font-bold text-rose-950 leading-tight">
          {hasMoodToday ? getMotivationalHeader(user.moodToday) : 'how are you feeling right now?'}
        </h1>
      </div>

      {/* Avatar + yesterday summary */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 3D Avatar */}
        <div className="card p-4 flex flex-col items-center justify-center flex-shrink-0">
          <Avatar3D score={avatarScore} size={160} />
          <p className="text-xs font-bold text-purple-500 mt-1">{getAvatarLabel(avatarScore)}</p>
          <p className="text-xs text-rose-400 mt-0.5">based on today so far</p>
        </div>

        {/* Yesterday's time analysis */}
        {yesterdaySummary ? (
          <div className="card p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-pink-400" />
              <p className="text-xs font-bold text-pink-400 uppercase tracking-wider">Yesterday</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-green-50 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-green-600">{yesterdaySummary.completedMinutes}m</p>
                <p className="text-xs text-green-500">time invested</p>
              </div>
              <div className={`rounded-2xl p-3 text-center ${yesterdaySummary.missedMinutes > 0 ? 'bg-red-50' : 'bg-pink-50'}`}>
                <p className={`text-lg font-black ${yesterdaySummary.missedMinutes > 0 ? 'text-red-500' : 'text-pink-400'}`}>
                  {yesterdaySummary.missedMinutes}m
                </p>
                <p className={`text-xs ${yesterdaySummary.missedMinutes > 0 ? 'text-red-400' : 'text-pink-400'}`}>
                  {yesterdaySummary.missedMinutes > 0 ? 'not used' : 'nothing missed'}
                </p>
              </div>
            </div>

            {/* Completion bar */}
            <div className="xp-bar mb-1">
              <div className="xp-bar-fill" style={{ width: `${yesterdaySummary.completionRate}%` }} />
            </div>
            <p className="text-xs text-rose-400 mb-2">{yesterdaySummary.completionRate}% of planned time used · {yesterdaySummary.completedCount}/{yesterdaySummary.totalCount} quests</p>

            {/* Missed quests */}
            {yesterdaySummary.missedTitles?.length > 0 && (
              <div>
                <p className="text-xs text-rose-500 font-semibold mb-1">didn't finish:</p>
                {yesterdaySummary.missedTitles.slice(0, 3).map((t, i) => (
                  <p key={i} className="text-xs text-rose-400 truncate">→ {t}</p>
                ))}
                {yesterdaySummary.missedTitles.length > 3 && (
                  <p className="text-xs text-rose-300">+{yesterdaySummary.missedTitles.length - 3} more</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="card p-5 flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl mb-2">🌙</p>
              <p className="text-sm font-semibold text-rose-700">No report yet</p>
              <p className="text-xs text-rose-400 mt-1">Shows up after your first full day</p>
            </div>
          </div>
        )}
      </div>

      {/* Character card */}
      <div className="relative overflow-hidden rounded-3xl" style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(250,244,255,0.9))',
        border: '1px solid rgba(220,160,220,0.2)',
        boxShadow: '0 4px 32px rgba(200,80,150,0.1), 0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {/* Top gradient stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-500"/>

        {/* Background glow shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #f0abfc, transparent)' }}/>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #fda4af, transparent)' }}/>

        <div className="relative p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-black"
                style={{ boxShadow: '0 4px 16px rgba(168,85,247,0.4)' }}>
                {user.name?.[0] || 'S'}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                {user.level}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-rose-950 leading-tight">{user.name}</h2>
              <p className="text-xs text-purple-500 mt-0.5">{getLevelTitle(user.level, user.stats, quests)} · {user.avatarClass}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xl font-black text-amber-500 leading-none">🪙 {user.coins}</p>
              <p className="text-xs text-rose-300 mt-0.5">coins</p>
            </div>
          </div>

          {/* XP section */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-rose-400 font-semibold">{user.xp} / {xpNeeded} XP</span>
              <span className="text-purple-400 font-semibold">{xpPct}% → Lv {user.level + 1}</span>
            </div>
            <XPBar xp={user.xp} needed={xpNeeded}/>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            {[
              { val: completedToday,     label: 'done today',    color: 'text-pink-500',   bg: 'from-pink-50   to-rose-50'  },
              { val: activeQuests.length, label: 'quests open',  color: 'text-violet-500', bg: 'from-violet-50 to-purple-50'},
              { val: habitsToday,         label: 'habits done',  color: 'text-amber-500',  bg: 'from-amber-50  to-yellow-50'},
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-2xl p-2.5 text-center border border-white/60`}>
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                <p className="text-[11px] text-rose-400 leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood check-in */}
      {!hasMoodToday && (
        <div className="card p-5 animate-slide-up">
          <p className="text-sm font-semibold text-rose-900 mb-4">what's your energy like right now?</p>
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
            {user.moodToday <= 2 && ' — let\'s keep it light. just one thing today.'}
          </span>
        </div>
      )}

      {/* Just One Thing mode */}
      {activeQuests.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-rose-700">
            {justOneMode ? "✨ just this one:" : "your focus"}
          </p>
          <button
            onClick={() => setJustOneMode(!justOneMode)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${justOneMode ? 'bg-purple-100 text-purple-600' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'}`}
          >
            {justOneMode ? 'show everything' : '😵 overwhelmed? one thing'}
          </button>
        </div>
      )}

      {/* Soul Quest — always first */}
      {soulQuest && !justOneMode && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={14} className="text-purple-500" />
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">soul quest</p>
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
              <p className="text-xs font-bold text-pink-500 uppercase tracking-wider">up next</p>
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
              <p className="text-sm font-semibold text-rose-700">you're clear ✓</p>
              <p className="text-xs text-rose-400 mt-1">drop more into the brain dump whenever</p>
              <button onClick={() => navigate('/app/my-life')} className="btn-ghost text-xs px-4 py-2 mt-3">
                open brain dump
              </button>
            </div>
          )}
        </div>
      )}

      {/* Identity anchors */}
      {user.identityAnchors?.length > 0 && (
        <div className="bg-soul-gradient rounded-3xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-400 text-sm">✦</span>
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">who you are</p>
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
  if (h < 12) return 'good morning'
  if (h < 17) return 'hey'
  return 'good evening'
}

function getMotivationalHeader(mood) {
  if (mood >= 4) return "let's make today count."
  if (mood === 3) return "one step at a time."
  return "we keep it gentle today."
}

function getAvatarLabel(score) {
  if (score >= 80) return 'Glowing ✨'
  if (score >= 60) return 'Happy 🌸'
  if (score >= 40) return 'Okay 🌿'
  if (score >= 20) return 'Low 😔'
  return 'Drained 😴'
}

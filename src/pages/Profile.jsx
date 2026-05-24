import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Trophy, Flame, Star, RotateCcw, Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

function BackupRestore() {
  const fileRef = useRef()
  const [msg, setMsg] = useState(null)

  const handleExport = () => {
    const data = localStorage.getItem('lifexp-store')
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifexp-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ type: 'ok', text: 'Backup saved to your Downloads folder ✨' })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        JSON.parse(ev.target.result) // validate
        localStorage.setItem('lifexp-store', ev.target.result)
        setMsg({ type: 'ok', text: 'Progress restored! Refreshing...' })
        setTimeout(() => window.location.reload(), 1200)
      } catch {
        setMsg({ type: 'err', text: 'Invalid backup file.' })
        setTimeout(() => setMsg(null), 3000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="card p-5 space-y-3">
      <p className="text-sm font-bold text-rose-800">Your Save File</p>
      <p className="text-xs text-rose-500 leading-relaxed">
        Progress lives in your browser. Export a backup regularly so you never lose your journey — especially before clearing browser data.
      </p>

      <div className="flex gap-3">
        <button onClick={handleExport} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
          <Download size={15} /> Export Backup
        </button>
        <button onClick={() => fileRef.current.click()} className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
          <Upload size={15} /> Restore Backup
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {msg && (
        <p className={`text-xs font-semibold px-3 py-2 rounded-xl ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </p>
      )}
    </div>
  )
}

function getLevelTitle(level) {
  if (level <= 3) return 'Signal Apprentice'
  if (level <= 6) return 'LiDAR Ranger'
  if (level <= 10) return 'Sensor Mage'
  if (level <= 15) return 'Quantum Engineer'
  return 'Architect of Worlds'
}

const ACHIEVEMENTS = [
  { id: 'first_quest', emoji: '⚔️', title: 'First Quest', desc: 'Completed your first quest', check: (q) => q.filter(x => x.completed).length >= 1 },
  { id: 'soul_start', emoji: '✨', title: 'Soul Awakening', desc: 'Completed your first soul quest', check: (q) => q.filter(x => x.completed && x.category === 'soul').length >= 1 },
  { id: 'ten_quests', emoji: '🏆', title: 'Quest Veteran', desc: '10 quests completed', check: (q) => q.filter(x => x.completed).length >= 10 },
  { id: 'career_move', emoji: '💼', title: 'Career Warrior', desc: 'Completed 5 career quests', check: (q) => q.filter(x => x.completed && x.category === 'career').length >= 5 },
  { id: 'soul_guardian', emoji: '💜', title: 'Soul Guardian', desc: '10 soul quests completed', check: (q) => q.filter(x => x.completed && x.category === 'soul').length >= 10 },
  { id: 'level5', emoji: '⭐', title: 'Level 5', desc: 'Reached Level 5', check: (_, u) => u.level >= 5 },
  { id: 'level10', emoji: '🌟', title: 'Level 10', desc: 'Reached Level 10', check: (_, u) => u.level >= 10 },
]

export default function Profile() {
  const user = useAppStore((s) => s.user)
  const quests = useAppStore((s) => s.quests)
  const habits = useAppStore((s) => s.habits)
  const resetOnboarding = useAppStore((s) => s.resetOnboarding)
  const xpNeeded = useAppStore((s) => s.xpNeeded)()
  const navigate = useNavigate()

  const radarData = [
    { stat: '🧠 Intel', value: user.stats?.intelligence || 0 },
    { stat: '⚡ Ambition', value: user.stats?.ambition || 0 },
    { stat: '💪 Discipline', value: user.stats?.discipline || 0 },
    { stat: '❤️ Soul', value: user.stats?.soul || 0 },
    { stat: '🔥 Resilience', value: user.stats?.resilience || 0 },
    { stat: '🌐 Connection', value: user.stats?.connection || 0 },
  ]

  const completedQuests = quests.filter(q => q.completed)
  const totalXPEarned = completedQuests.reduce((s, q) => s + q.xp, 0)
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0)

  const achievements = ACHIEVEMENTS.filter(a => a.check(quests, user))

  const handleReset = () => {
    if (confirm('Reset your profile? This clears all data and restarts onboarding.')) {
      resetOnboarding()
      navigate('/app/onboarding')
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Avatar card */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-60" />
        <div className="relative flex items-start gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-glow-purple flex-shrink-0">
            {user.name?.[0] || 'S'}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <h1 className="font-display text-2xl font-black text-rose-950">{user.name}</h1>
            </div>
            <p className="text-sm text-purple-600 font-semibold mb-1">✨ {user.avatarClass}</p>
            <p className="text-xs text-rose-400 mb-3">Level {user.level} · {getLevelTitle(user.level)}</p>

            {/* XP bar */}
            <div className="xp-bar mb-1">
              <div className="xp-bar-fill" style={{ width: `${Math.round((user.xp / xpNeeded) * 100)}%` }} />
            </div>
            <p className="text-xs text-rose-400">{user.xp} / {xpNeeded} XP to Level {user.level + 1}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Total XP', value: totalXPEarned, color: 'text-purple-600' },
            { label: 'Coins', value: `🪙 ${user.coins}`, color: 'text-amber-500' },
            { label: 'Quests Done', value: completedQuests.length, color: 'text-pink-600' },
            { label: 'Habits', value: habits.length, color: 'text-green-600' },
            { label: 'Best Streak', value: `🔥 ${longestStreak}`, color: 'text-orange-500' },
            { label: 'Level', value: user.level, color: 'text-indigo-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/60 rounded-2xl p-3 text-center">
              <p className={`font-black text-lg ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-rose-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Radar chart */}
      <div className="card p-5">
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-4">Character Stats</p>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#fce7f3" />
            <PolarAngleAxis dataKey="stat" tick={{ fontSize: 10, fill: '#9f6b7a' }} />
            <Radar dataKey="value" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} dot={{ fill: '#a855f7', r: 3 }} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {radarData.map(d => (
            <div key={d.stat} className="flex items-center gap-2">
              <div className="stat-bar flex-1">
                <div className="stat-bar-fill bg-gradient-to-r from-pink-400 to-purple-500" style={{ width: `${d.value}%` }} />
              </div>
              <span className="text-xs text-rose-400 w-6 text-right">{d.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-rose-400 text-center mt-3">Stats grow as you complete quests in each category</p>
      </div>

      {/* Achievements */}
      <div className="card p-5">
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-4">Achievements ({achievements.length}/{ACHIEVEMENTS.length})</p>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map(a => {
            const earned = achievements.find(x => x.id === a.id)
            return (
              <div key={a.id} className={`rounded-2xl p-3 border transition-all ${earned ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                <div className="text-2xl mb-1">{a.emoji}</div>
                <p className="text-xs font-bold text-rose-900">{a.title}</p>
                <p className="text-xs text-rose-400">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Level progress */}
      <div className="card p-5">
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">Level Roadmap</p>
        {[
          { range: '1–3', title: 'Signal Apprentice', emoji: '🌱' },
          { range: '4–6', title: 'LiDAR Ranger', emoji: '📡' },
          { range: '7–10', title: 'Sensor Mage', emoji: '🔮' },
          { range: '11–15', title: 'Quantum Engineer', emoji: '⚡' },
          { range: '16+', title: 'Architect of Worlds', emoji: '🌌' },
        ].map((tier, i) => {
          const active = getLevelTitle(user.level) === tier.title
          return (
            <div key={i} className={`flex items-center gap-3 py-2 ${i < 4 ? 'border-b border-pink-50' : ''}`}>
              <span className="text-xl w-8">{tier.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${active ? 'text-rose-900' : 'text-rose-400'}`}>{tier.title}</p>
                <p className="text-xs text-rose-300">Level {tier.range}</p>
              </div>
              {active && <span className="text-xs bg-pink-100 text-pink-600 font-bold px-2 py-0.5 rounded-full">Current</span>}
            </div>
          )
        })}
      </div>

      {/* Backup / Restore */}
      <BackupRestore />

      {/* Reset */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-rose-700">Reset profile</p>
          <p className="text-xs text-rose-400">Clears all data and restarts onboarding.</p>
        </div>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-2 rounded-xl transition-all">
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </div>
  )
}

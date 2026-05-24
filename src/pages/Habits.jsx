import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'
import { Plus, Flame, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

// Build a full 365-day grid, aligned to weeks (Sun–Sat), like GitHub
function YearHeatmap({ completedDates, color }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from 364 days ago, then rewind to the previous Sunday
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  const dayOfWeek = start.getDay()
  start.setDate(start.getDate() - dayOfWeek) // rewind to Sunday

  // Build all days from start → today
  const days = []
  const cursor = new Date(start)
  while (cursor <= today) {
    days.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }

  // Group into columns of 7 (each column = one week)
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // Month labels: find first day of each month in our range
  const monthLabels = []
  weeks.forEach((week, wi) => {
    week.forEach((day, di) => {
      const d = new Date(day)
      if (d.getDate() <= 7 && di === 0) {
        monthLabels.push({ col: wi, label: d.toLocaleString('default', { month: 'short' }) })
      }
    })
  })

  const completedSet = new Set(completedDates)

  const cellColor = (day) => {
    if (!completedSet.has(day)) return 'bg-pink-100'
    if (color === 'soul')     return 'bg-purple-400'
    if (color === 'health')   return 'bg-emerald-400'
    if (color === 'learning') return 'bg-amber-400'
    if (color === 'career')   return 'bg-blue-400'
    if (color === 'morning')  return 'bg-rose-400'
    return 'bg-pink-400'
  }

  const totalDone = completedDates.filter(d => {
    const date = new Date(d)
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() - 364)
    return date >= cutoff
  }).length

  return (
    <div className="mt-3">
      <div className="overflow-x-auto scrollbar-cozy pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '18px' }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.col === wi)
              return (
                <div key={wi} className="flex-shrink-0 w-[13px] text-[9px] text-rose-300 font-medium">
                  {label ? label.label : ''}
                </div>
              )
            })}
          </div>

          {/* Day-of-week labels + grid */}
          <div className="flex gap-0.5">
            {/* Row labels */}
            <div className="flex flex-col gap-0.5 mr-0.5 flex-shrink-0">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="w-3 h-3 text-[8px] text-rose-300 flex items-center justify-center">{i % 2 === 1 ? d : ''}</div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5 flex-shrink-0">
                {week.map((day, di) => (
                  <div
                    key={day}
                    title={`${day}${completedSet.has(day) ? ' ✓' : ''}`}
                    className={`w-3 h-3 rounded-[2px] transition-all ${cellColor(day)} ${completedSet.has(day) ? 'opacity-100' : 'opacity-60'}`}
                  />
                ))}
                {/* Pad incomplete last week */}
                {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, pi) => (
                  <div key={`pad-${pi}`} className="w-3 h-3" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-2 text-xs text-rose-400">
        <span>{totalDone} days completed in the past year</span>
        <div className="flex items-center gap-1 ml-auto">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-pink-100" />
          <div className={`w-2.5 h-2.5 rounded-[2px] opacity-40 ${cellColor('filled')}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] opacity-70 ${cellColor('filled')}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] ${cellColor('filled')}`} />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

const CATEGORY_COLOR = {
  health: 'health', learning: 'learning', soul: 'soul',
  career: 'career', morning: 'morning',
}

export default function Habits() {
  const habits      = useAppStore((s) => s.habits)
  const addHabit    = useAppStore((s) => s.addHabit)
  const deleteHabit = useAppStore((s) => s.deleteHabit)
  const toggleHabit = useAppStore((s) => s.toggleHabit)

  const [showAdd, setShowAdd]   = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', category: 'health', xp: 25, emoji: '🌸', frequency: 'daily' })
  const [expanded, setExpanded] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const handleAdd = () => {
    if (!newHabit.name.trim()) return
    addHabit(newHabit)
    setNewHabit({ name: '', category: 'health', xp: 25, emoji: '🌸', frequency: 'daily' })
    setShowAdd(false)
  }

  const handleDelete = (id) => {
    deleteHabit(id)
    setConfirmDelete(null)
    if (expanded === id) setExpanded(null)
  }

  const doneToday = habits.filter(h => h.completedDates?.includes(today)).length

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-950">Habits</h1>
          <p className="text-sm text-rose-500 mt-1">{doneToday}/{habits.length} done today</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2.5">
          <Plus size={15} />
          Add Habit
        </button>
      </div>

      {/* Daily progress bar */}
      {habits.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-600">Today's progress</span>
            <span className="text-xs text-purple-500 font-bold">{doneToday}/{habits.length}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: habits.length ? `${(doneToday / habits.length) * 100}%` : '0%' }} />
          </div>
          {doneToday === habits.length && habits.length > 0 && (
            <p className="text-xs text-center text-pink-500 font-semibold mt-2">🎉 All habits done today! You're incredible.</p>
          )}
        </div>
      )}

      {/* Add habit form */}
      {showAdd && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-rose-900 mb-4">New Habit</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🌸"
                value={newHabit.emoji}
                onChange={e => setNewHabit(h => ({ ...h, emoji: e.target.value }))}
                className="input-cozy w-16 text-center text-xl"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="Habit name..."
                value={newHabit.name}
                onChange={e => setNewHabit(h => ({ ...h, name: e.target.value }))}
                className="input-cozy flex-1"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-rose-500 mb-1 block">Category</label>
                <select value={newHabit.category} onChange={e => setNewHabit(h => ({ ...h, category: e.target.value }))} className="input-cozy text-sm">
                  <option value="health">🌿 Health</option>
                  <option value="morning">🌅 Morning</option>
                  <option value="soul">✨ Soul</option>
                  <option value="learning">📚 Learning</option>
                  <option value="career">💼 Career</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-rose-500 mb-1 block">Frequency</label>
                <select value={newHabit.frequency} onChange={e => setNewHabit(h => ({ ...h, frequency: e.target.value }))} className="input-cozy text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-rose-500 mb-1 block">XP reward</label>
                <input type="number" value={newHabit.xp} onChange={e => setNewHabit(h => ({ ...h, xp: +e.target.value }))} className="input-cozy text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary text-sm flex-1">Add Habit 🌸</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Habit list */}
      {habits.length > 0 ? (
        <div className="space-y-3">
          {habits.map(h => {
            const done             = h.completedDates?.includes(today)
            const streakMultiplier = h.currentStreak >= 30 ? 2 : h.currentStreak >= 7 ? 1.5 : 1
            const isExpanded       = expanded === h.id
            const isConfirming     = confirmDelete === h.id

            return (
              <div key={h.id} className={`card-glow transition-all ${done ? 'ring-1 ring-green-200' : ''}`}>

                {/* Main row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Check button */}
                  <button
                    onClick={() => toggleHabit(h.id)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all flex-shrink-0 ${
                      done
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm'
                        : 'bg-pink-50 hover:bg-pink-100 border border-pink-200'
                    }`}
                  >
                    {done ? <Check size={18} className="text-white" strokeWidth={3} /> : h.emoji}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${done ? 'line-through text-pink-300' : 'text-rose-900'}`}>
                      {h.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="flex items-center gap-0.5 text-xs text-orange-500 font-bold">
                        <Flame size={10} /> {h.currentStreak} day streak
                      </span>
                      {streakMultiplier > 1 && (
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">{streakMultiplier}x XP</span>
                      )}
                      <span className="text-xs text-purple-400">+{Math.round(h.xp * streakMultiplier)} XP</span>
                      {h.longestStreak > 0 && (
                        <span className="text-xs text-rose-300">best: {h.longestStreak}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Expand/collapse */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : h.id)}
                      className="p-2 rounded-xl hover:bg-pink-50 text-rose-300 hover:text-rose-500 transition-colors"
                      title="View year streak"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {/* Delete */}
                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-semibold"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-rose-400 hover:text-rose-600 px-1 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(h.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-rose-200 hover:text-red-400 transition-colors"
                        title="Delete habit"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Year heatmap */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-pink-100 pt-3 animate-fade-in">
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                      Past year — {h.completedDates?.length || 0} total completions
                    </p>
                    <YearHeatmap
                      completedDates={h.completedDates || []}
                      color={CATEGORY_COLOR[h.category] || 'pink'}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-3">🌸</p>
          <p className="font-semibold text-rose-700">No habits yet.</p>
          <p className="text-sm text-rose-400 mt-1">Add a daily ritual and watch your streak grow.</p>
        </div>
      )}

      {/* XP multiplier info */}
      <div className="card p-4 flex gap-6 text-xs text-rose-600">
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-orange-400" />
          7 days = <strong className="text-orange-500">1.5x XP</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-red-500" />
          30 days = <strong className="text-red-500">2x XP</strong>
        </div>
      </div>
    </div>
  )
}

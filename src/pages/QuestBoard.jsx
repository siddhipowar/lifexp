import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import QuestCard from '../components/QuestCard'
import { Plus, Filter } from 'lucide-react'

const FILTERS = ['All', 'Today', 'This Week', 'Career', 'Soul', 'Health', 'Learning', 'Personal', 'Done']

const CATEGORY_EMOJIS = {
  career: '💼', work: '🔧', health: '🌿', learning: '📚',
  personal: '🌸', relationships: '❤️', soul: '✨',
}

export default function QuestBoard() {
  const quests = useAppStore((s) => s.quests)
  const addQuest = useAppStore((s) => s.addQuest)
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newQuest, setNewQuest] = useState({ title: '', category: 'personal', estimatedMinutes: 30, xp: 50, coins: 5, priority: 2, tip: '', scheduledDay: 'today' })

  const filtered = quests.filter(q => {
    if (filter === 'Done')      return q.completed
    if (filter === 'Today')     return !q.completed && q.scheduledDay === 'today'
    if (filter === 'This Week') return !q.completed && ['today', 'tomorrow', 'this_week'].includes(q.scheduledDay)
    if (filter === 'All')       return !q.completed
    return !q.completed && q.category === filter.toLowerCase()
  })

  const handleAdd = () => {
    if (!newQuest.title.trim()) return
    addQuest({ ...newQuest, id: Date.now().toString(), parentGoal: 'Manual' })
    setNewQuest({ title: '', category: 'personal', estimatedMinutes: 30, xp: 50, coins: 5, priority: 2, tip: '', scheduledDay: 'today' })
    setShowAdd(false)
  }

  const completedCount = quests.filter(q => q.completed).length

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-950">Quest Board</h1>
          <p className="text-sm text-rose-500 mt-1">{quests.filter(q => !q.completed).length} active · {completedCount} completed ✨</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2.5">
          <Plus size={15} />
          Add Quest
        </button>
      </div>

      {/* Add quest form */}
      {showAdd && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-rose-900 mb-4">New Quest</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Quest title..."
              value={newQuest.title}
              onChange={e => setNewQuest(q => ({ ...q, title: e.target.value }))}
              className="input-cozy"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-rose-500 mb-1 block">Category</label>
                <select
                  value={newQuest.category}
                  onChange={e => setNewQuest(q => ({ ...q, category: e.target.value }))}
                  className="input-cozy text-sm"
                >
                  {Object.entries(CATEGORY_EMOJIS).map(([k, v]) => (
                    <option key={k} value={k}>{v} {k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-rose-500 mb-1 block">Schedule</label>
                <select
                  value={newQuest.scheduledDay}
                  onChange={e => setNewQuest(q => ({ ...q, scheduledDay: e.target.value }))}
                  className="input-cozy text-sm"
                >
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This week</option>
                  <option value="next_week">Next week</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-rose-500 mb-1 block">Minutes</label>
                <input type="number" value={newQuest.estimatedMinutes} onChange={e => setNewQuest(q => ({ ...q, estimatedMinutes: +e.target.value }))} className="input-cozy text-sm" />
              </div>
              <div>
                <label className="text-xs text-rose-500 mb-1 block">XP</label>
                <input type="number" value={newQuest.xp} onChange={e => setNewQuest(q => ({ ...q, xp: +e.target.value }))} className="input-cozy text-sm" />
              </div>
              <div>
                <label className="text-xs text-rose-500 mb-1 block">Priority</label>
                <select value={newQuest.priority} onChange={e => setNewQuest(q => ({ ...q, priority: +e.target.value }))} className="input-cozy text-sm">
                  <option value={1}>🔴 Urgent</option>
                  <option value={2}>🟡 Soon</option>
                  <option value={3}>🟢 Later</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary text-sm flex-1">Add Quest ✨</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-sm'
                : 'bg-white/70 text-rose-600 hover:bg-pink-50 border border-pink-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Quest list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {/* Soul quests first */}
          {filtered.filter(q => q.category === 'soul').map(q => <QuestCard key={q.id} quest={q} showDelete />)}
          {/* Priority 1 */}
          {filtered.filter(q => q.category !== 'soul' && q.priority === 1).map(q => <QuestCard key={q.id} quest={q} showDelete />)}
          {/* Rest */}
          {filtered.filter(q => q.category !== 'soul' && q.priority !== 1).map(q => <QuestCard key={q.id} quest={q} showDelete />)}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-3">✨</p>
          <p className="font-semibold text-rose-700">No quests here yet.</p>
          <p className="text-sm text-rose-400 mt-1">Add one above or use the Master Document to generate a full plan.</p>
        </div>
      )}
    </div>
  )
}

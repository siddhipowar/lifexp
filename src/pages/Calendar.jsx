import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { callClaudeJSON } from '../lib/claude'
import { CALENDAR_SYSTEM } from '../lib/prompts'
import { Plus, Trash2, Sparkles, Loader, ChevronLeft, ChevronRight } from 'lucide-react'

const CAT_COLORS = {
  career:   'bg-blue-100 text-blue-700 border-blue-200',
  health:   'bg-green-100 text-green-700 border-green-200',
  personal: 'bg-pink-100 text-pink-700 border-pink-200',
  social:   'bg-purple-100 text-purple-700 border-purple-200',
  learning: 'bg-amber-100 text-amber-700 border-amber-200',
  soul:     'bg-violet-100 text-violet-700 border-violet-200',
}

function getWeekDays(date) {
  const d = new Date(date)
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(start)
    nd.setDate(start.getDate() + i)
    return nd.toISOString().split('T')[0]
  })
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const calendarEvents = useAppStore((s) => s.calendarEvents)
  const addCalendarEvent = useAppStore((s) => s.addCalendarEvent)
  const deleteCalendarEvent = useAppStore((s) => s.deleteCalendarEvent)

  const [weekOffset, setWeekOffset] = useState(0)
  const [aiInput, setAiInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [manual, setManual] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', category: 'personal', emoji: '📌', notes: '' })

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const weekDays = getWeekDays(baseDate)
  const today = new Date().toISOString().split('T')[0]

  const handleAIParse = async () => {
    if (!aiInput.trim() || loading) return
    setLoading(true)
    try {
      const result = await callClaudeJSON({
        system: CALENDAR_SYSTEM,
        messages: [{ role: 'user', content: aiInput }],
        maxTokens: 200,
      })
      addCalendarEvent(result)
      setAiInput('')
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleManualAdd = () => {
    if (!manual.title.trim()) return
    addCalendarEvent(manual)
    setManual({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', category: 'personal', emoji: '📌', notes: '' })
    setShowManual(false)
  }

  const eventsOnDay = (day) => calendarEvents.filter(e => e.date === day).sort((a, b) => a.time?.localeCompare(b.time))

  const monthLabel = new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="font-display text-3xl font-bold text-rose-950">Calendar</h1>
        <p className="text-sm text-rose-500 mt-1">Just describe your event — AI will schedule it.</p>
      </div>

      {/* AI Event Creator */}
      <div className="card p-5">
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">✨ AI Event Creator</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            placeholder="e.g. 'Waymo interview next Tuesday at 2pm' or 'gym tomorrow morning'"
            className="input-cozy flex-1 text-sm"
            onKeyDown={e => e.key === 'Enter' && handleAIParse()}
          />
          <button onClick={handleAIParse} disabled={loading || !aiInput.trim()} className="btn-primary px-3 py-2.5 flex-shrink-0">
            {loading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
        </div>
        <button onClick={() => setShowManual(!showManual)} className="text-xs text-rose-400 hover:text-rose-600 mt-2">
          + Add manually instead
        </button>

        {showManual && (
          <div className="mt-4 space-y-3 animate-slide-up">
            <div className="flex gap-2">
              <input type="text" placeholder="Emoji" value={manual.emoji} onChange={e => setManual(m => ({ ...m, emoji: e.target.value }))} className="input-cozy w-14 text-center text-xl" maxLength={2} />
              <input type="text" placeholder="Event title..." value={manual.title} onChange={e => setManual(m => ({ ...m, title: e.target.value }))} className="input-cozy flex-1" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="date" value={manual.date} onChange={e => setManual(m => ({ ...m, date: e.target.value }))} className="input-cozy text-sm" />
              <input type="time" value={manual.time} onChange={e => setManual(m => ({ ...m, time: e.target.value }))} className="input-cozy text-sm" />
              <select value={manual.category} onChange={e => setManual(m => ({ ...m, category: e.target.value }))} className="input-cozy text-sm">
                <option value="career">💼 Career</option>
                <option value="health">🌿 Health</option>
                <option value="personal">🌸 Personal</option>
                <option value="social">👥 Social</option>
                <option value="learning">📚 Learning</option>
                <option value="soul">✨ Soul</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleManualAdd} className="btn-primary text-sm flex-1">Add Event</button>
              <button onClick={() => setShowManual(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Week view */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl hover:bg-pink-100 text-pink-500">
            <ChevronLeft size={18} />
          </button>
          <p className="font-semibold text-rose-900">{monthLabel}</p>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl hover:bg-pink-100 text-pink-500">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const dayEvents = eventsOnDay(day)
            const isToday = day === today
            const dateNum = new Date(day).getDate()

            return (
              <div key={day} className="flex flex-col">
                {/* Day header */}
                <div className="text-center mb-1">
                  <p className="text-xs text-rose-400">{DAY_LABELS[i]}</p>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-sm font-bold ${isToday ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-glow-pink' : 'text-rose-700'}`}>
                    {dateNum}
                  </div>
                </div>
                {/* Events */}
                <div className="space-y-1 min-h-16">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      className={`rounded-lg px-1.5 py-1 text-[10px] font-medium leading-tight border ${CAT_COLORS[ev.category] || 'bg-pink-100 text-pink-700 border-pink-200'} group relative`}
                    >
                      <span>{ev.emoji} </span>
                      <span className="hidden md:inline">{ev.title.slice(0, 12)}{ev.title.length > 12 ? '…' : ''}</span>
                      <button
                        onClick={() => deleteCalendarEvent(ev.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white rounded-full hidden group-hover:flex items-center justify-center text-[8px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] text-rose-400 text-center">+{dayEvents.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event list for this week */}
      <div>
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">This week's events</p>
        {weekDays.some(d => eventsOnDay(d).length > 0) ? (
          <div className="space-y-2">
            {weekDays.flatMap(d =>
              eventsOnDay(d).map(ev => (
                <div key={ev.id} className="card-glow flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{ev.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-rose-900 truncate">{ev.title}</p>
                    <p className="text-xs text-rose-400">{ev.date} {ev.time && `· ${ev.time}`}</p>
                  </div>
                  <span className={`badge text-xs ${CAT_COLORS[ev.category] || 'bg-pink-100 text-pink-700 border-pink-200'}`}>{ev.category}</span>
                  <button onClick={() => deleteCalendarEvent(ev.id)} className="text-red-300 hover:text-red-500 p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-sm text-rose-500">No events this week. Add something!</p>
          </div>
        )}
      </div>
    </div>
  )
}

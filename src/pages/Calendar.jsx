import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { callClaudeJSON } from '../lib/claude'
import { CALENDAR_SYSTEM, DAY_PLANNER_SYSTEM } from '../lib/prompts'
import { Plus, Trash2, Sparkles, Loader, ChevronLeft, ChevronRight, CalendarDays, Briefcase, Moon, Sun, CheckSquare, Square, X, Check, Clock } from 'lucide-react'

const CAT_COLORS = {
  career:   'bg-blue-100 text-blue-700 border-blue-200',
  health:   'bg-green-100 text-green-700 border-green-200',
  personal: 'bg-pink-100 text-pink-700 border-pink-200',
  social:   'bg-purple-100 text-purple-700 border-purple-200',
  learning: 'bg-amber-100 text-amber-700 border-amber-200',
  soul:     'bg-violet-100 text-violet-700 border-violet-200',
  work:     'bg-sky-100 text-sky-700 border-sky-200',
}

const CAT_BAR = {
  career:   'bg-blue-400',
  health:   'bg-green-400',
  personal: 'bg-pink-400',
  social:   'bg-purple-400',
  learning: 'bg-amber-400',
  soul:     'bg-violet-400',
  work:     'bg-sky-400',
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

// ── Day Planner Wizard ────────────────────────────────────────────────────────
function DayPlanner({ quests, onClose, onConfirm }) {
  const today = new Date().toISOString().split('T')[0]
  const [step, setStep] = useState(1) // 1=schedule, 2=quests, 3=loading, 4=preview
  const [wakeTime, setWakeTime] = useState('07:00')
  const [sleepTime, setSleepTime] = useState('22:30')
  const [goingToWork, setGoingToWork] = useState(false)
  const [workStart, setWorkStart] = useState('09:00')
  const [workEnd, setWorkEnd] = useState('17:00')
  const [otherCommitments, setOtherCommitments] = useState('')
  const [selectedQuestIds, setSelectedQuestIds] = useState(
    quests.filter(q => !q.completed && (q.scheduledDay === 'today' || q.scheduledDay === 'tomorrow')).map(q => q.id)
  )
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const activeQuests = quests.filter(q => !q.completed)
  const toggleQuest = (id) => setSelectedQuestIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  const generate = async () => {
    setStep(3)
    setError(null)
    try {
      const selectedQuests = activeQuests.filter(q => selectedQuestIds.includes(q.id))
      const userMsg = [
        `Wake time: ${wakeTime}`,
        `Sleep time: ${sleepTime}`,
        goingToWork ? `Going to work: yes, ${workStart}–${workEnd}` : 'Going to work: no, working from home or day off',
        otherCommitments ? `Other commitments: ${otherCommitments}` : '',
        selectedQuests.length > 0
          ? `Quests to schedule:\n${selectedQuests.map(q =>
              `- [${q.id}] "${q.title}" (${q.category}, ${q.estimatedMinutes || 30} min, priority ${q.priority})`
            ).join('\n')}`
          : 'No specific quests — just build a healthy structured day.',
      ].filter(Boolean).join('\n')

      const blocks = await callClaudeJSON({
        system: DAY_PLANNER_SYSTEM(today),
        messages: [{ role: 'user', content: userMsg }],
        maxTokens: 2000,
      })
      setPreview(Array.isArray(blocks) ? blocks : [])
      setStep(4)
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Try again.')
      setStep(2)
    }
  }

  const confirm = () => {
    onConfirm(preview.map(b => ({ ...b, date: today })))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(30,10,40,0.45)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden animate-slide-up"
        style={{ background: 'linear-gradient(165deg, rgba(255,250,254,0.99), rgba(250,244,255,0.99))', border: '1px solid rgba(220,160,220,0.25)', boxShadow: '0 24px 80px rgba(200,80,150,0.18)' }}>

        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400" />
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <p className="font-display text-lg font-black text-rose-950">Plan My Day ✨</p>
            <p className="text-xs text-rose-400 mt-0.5">
              {step === 1 && 'step 1 of 2 — your schedule'}
              {step === 2 && 'step 2 of 2 — pick your quests'}
              {step === 3 && 'building your day…'}
              {step === 4 && `${preview?.length || 0} time blocks ready`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-400 hover:bg-pink-100">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto space-y-4">

          {/* Step 1 — Schedule inputs */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mb-1.5">
                    <Sun size={12} /> Wake up
                  </label>
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                    className="input-cozy w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mb-1.5">
                    <Moon size={12} /> Bedtime
                  </label>
                  <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)}
                    className="input-cozy w-full text-sm" />
                </div>
              </div>

              {/* Work toggle */}
              <div className="rounded-2xl border border-pink-100 overflow-hidden">
                <button
                  onClick={() => setGoingToWork(!goingToWork)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${goingToWork ? 'bg-blue-50' : 'bg-white/60'}`}
                >
                  <Briefcase size={16} className={goingToWork ? 'text-blue-500' : 'text-rose-300'} />
                  <span className={`text-sm font-semibold flex-1 text-left ${goingToWork ? 'text-blue-700' : 'text-rose-500'}`}>
                    Going to work today
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${goingToWork ? 'bg-blue-400' : 'bg-rose-100'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${goingToWork ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>
                {goingToWork && (
                  <div className="px-4 pb-3 pt-1 grid grid-cols-2 gap-3 bg-blue-50 border-t border-blue-100">
                    <div>
                      <label className="text-[11px] text-blue-500 font-semibold">Work starts</label>
                      <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
                        className="input-cozy w-full text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-[11px] text-blue-500 font-semibold">Work ends</label>
                      <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)}
                        className="input-cozy w-full text-sm mt-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Other commitments */}
              <div>
                <label className="text-xs font-bold text-rose-500 mb-1.5 block">Anything else today? <span className="font-normal text-rose-300">(optional)</span></label>
                <textarea
                  value={otherCommitments}
                  onChange={e => setOtherCommitments(e.target.value)}
                  placeholder="e.g. doctor at 3pm, dinner with family at 7pm, gym class at 6pm…"
                  rows={2}
                  className="input-cozy w-full text-sm resize-none"
                />
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full">
                Next: pick your quests →
              </button>
            </>
          )}

          {/* Step 2 — Quest selection */}
          {step === 2 && (
            <>
              <p className="text-xs text-rose-400">Choose what you want to tackle today. AI will fit them into your schedule realistically.</p>

              {activeQuests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm text-rose-500">No open quests. The AI will build you a healthy structured day.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Select all / none */}
                  <div className="flex gap-2 mb-1">
                    <button onClick={() => setSelectedQuestIds(activeQuests.map(q => q.id))} className="text-xs text-purple-500 hover:text-purple-700">select all</button>
                    <span className="text-rose-200">·</span>
                    <button onClick={() => setSelectedQuestIds([])} className="text-xs text-rose-400 hover:text-rose-600">clear</button>
                  </div>
                  {activeQuests.map(q => {
                    const selected = selectedQuestIds.includes(q.id)
                    return (
                      <button key={q.id} onClick={() => toggleQuest(q.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all text-left ${selected ? 'bg-purple-50 border-purple-200' : 'bg-white/60 border-pink-100 opacity-60'}`}>
                        {selected ? <CheckSquare size={16} className="text-purple-500 flex-shrink-0" /> : <Square size={16} className="text-rose-300 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-rose-900 truncate">{q.title}</p>
                          <p className="text-xs text-rose-400">{q.category} · {q.estimatedMinutes || 30} min</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[q.category] || 'bg-pink-100 text-pink-700 border-pink-200'}`}>
                          P{q.priority}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 text-sm">← back</button>
                <button onClick={generate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Sparkles size={15} /> Build my day
                </button>
              </div>
            </>
          )}

          {/* Step 3 — Loading */}
          {step === 3 && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center animate-pulse">
                <CalendarDays size={26} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-rose-700">Building your perfect day…</p>
              <p className="text-xs text-rose-400 text-center">Scheduling quests, meals, breaks, and everything in between</p>
              <Loader size={20} className="animate-spin text-purple-400 mt-2" />
            </div>
          )}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          {/* Step 4 — Preview */}
          {step === 4 && preview && (
            <>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {preview.map((block, i) => (
                  <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-2xl border ${CAT_COLORS[block.category] || 'bg-pink-50 border-pink-100'}`}>
                    <span className="text-lg flex-shrink-0 mt-0.5">{block.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-rose-900 leading-tight">{block.title}</p>
                      <p className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {block.time}{block.endTime ? ` – ${block.endTime}` : ''}
                      </p>
                      {block.notes && <p className="text-xs opacity-60 mt-0.5 leading-tight">{block.notes}</p>}
                    </div>
                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${CAT_BAR[block.category] || 'bg-pink-300'}`} />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1 text-sm">← redo</button>
                <button onClick={confirm} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Check size={15} /> Add to calendar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Today's timeline view ─────────────────────────────────────────────────────
function TodayTimeline({ events, onDelete }) {
  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(e => e.date === today).sort((a, b) => a.time?.localeCompare(b.time))
  if (todayEvents.length === 0) return null

  return (
    <div className="card p-5">
      <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-4">Today's timeline</p>
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-pink-200 via-purple-200 to-fuchsia-100" />
        <div className="space-y-2">
          {todayEvents.map((ev, i) => (
            <div key={ev.id} className="flex items-start gap-3 group">
              {/* dot */}
              <div className={`w-[10px] h-[10px] rounded-full mt-2.5 flex-shrink-0 z-10 ml-[17px] ${CAT_BAR[ev.category] || 'bg-pink-300'}`} />
              <div className={`flex-1 flex items-start gap-2.5 px-3 py-2 rounded-xl border ${CAT_COLORS[ev.category] || 'bg-pink-50 border-pink-100'}`}>
                <span className="text-base flex-shrink-0">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-rose-900 leading-tight">{ev.title}</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}
                  </p>
                  {ev.notes && <p className="text-xs opacity-50 mt-0.5 leading-tight">{ev.notes}</p>}
                </div>
                <button onClick={() => onDelete(ev.id)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity p-0.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Calendar ─────────────────────────────────────────────────────────────
export default function Calendar() {
  const calendarEvents = useAppStore((s) => s.calendarEvents)
  const addCalendarEvent = useAppStore((s) => s.addCalendarEvent)
  const deleteCalendarEvent = useAppStore((s) => s.deleteCalendarEvent)
  const quests = useAppStore((s) => s.quests)

  const [weekOffset, setWeekOffset] = useState(0)
  const [aiInput, setAiInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showPlanner, setShowPlanner] = useState(false)
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
    setManual({ title: '', date: today, time: '09:00', category: 'personal', emoji: '📌', notes: '' })
    setShowManual(false)
  }

  const handlePlannerConfirm = (blocks) => {
    blocks.forEach(b => addCalendarEvent(b))
  }

  const eventsOnDay = (day) => calendarEvents.filter(e => e.date === day).sort((a, b) => a.time?.localeCompare(b.time))
  const monthLabel = new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-950">Calendar</h1>
          <p className="text-sm text-rose-500 mt-1">Describe an event or let AI plan your whole day.</p>
        </div>
        <button
          onClick={() => setShowPlanner(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #a855f7)', boxShadow: '0 4px 16px rgba(244,63,94,0.35)' }}
        >
          <CalendarDays size={15} /> Plan My Day
        </button>
      </div>

      {/* Today's timeline (if planned) */}
      <TodayTimeline events={calendarEvents} onDelete={deleteCalendarEvent} />

      {/* AI Event Creator */}
      <div className="card p-5">
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">✨ Quick add</p>
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
          + add manually
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
                <div className="text-center mb-1">
                  <p className="text-xs text-rose-400">{DAY_LABELS[i]}</p>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-sm font-bold ${isToday ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-glow-pink' : 'text-rose-700'}`}>
                    {dateNum}
                  </div>
                </div>
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
                    <p className="text-[9px] text-rose-400 text-center">+{dayEvents.length - 3}</p>
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
                    <p className="text-xs text-rose-400">
                      {ev.date} {ev.time && `· ${ev.time}`}{ev.endTime && ` – ${ev.endTime}`}
                    </p>
                    {ev.notes && <p className="text-xs text-rose-300 truncate mt-0.5">{ev.notes}</p>}
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
            <p className="text-sm text-rose-500">No events this week.</p>
            <p className="text-xs text-rose-400 mt-1">Hit "Plan My Day" to let AI build your schedule.</p>
          </div>
        )}
      </div>

      {/* Day Planner Modal */}
      {showPlanner && (
        <DayPlanner
          quests={quests}
          onClose={() => setShowPlanner(false)}
          onConfirm={handlePlannerConfirm}
        />
      )}
    </div>
  )
}

import { Check, Clock, Trash2, ChevronDown } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'

const CATEGORY = {
  career:        { gradient: 'from-blue-500 to-cyan-400',    bg: 'bg-blue-50',   text: 'text-blue-700',   bar: 'bg-blue-400',   emoji: '💼', label: 'Career' },
  work:          { gradient: 'from-rose-500 to-pink-400',    bg: 'bg-rose-50',   text: 'text-rose-700',   bar: 'bg-rose-400',   emoji: '🔧', label: 'Work' },
  health:        { gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50',text: 'text-emerald-700',bar: 'bg-emerald-400',emoji: '🌿', label: 'Health' },
  learning:      { gradient: 'from-amber-500 to-yellow-400', bg: 'bg-amber-50',  text: 'text-amber-700',  bar: 'bg-amber-400',  emoji: '📚', label: 'Learning' },
  personal:      { gradient: 'from-pink-500 to-fuchsia-400', bg: 'bg-pink-50',   text: 'text-pink-700',   bar: 'bg-pink-400',   emoji: '🌸', label: 'Personal' },
  relationships: { gradient: 'from-red-500 to-rose-400',     bg: 'bg-red-50',    text: 'text-red-600',    bar: 'bg-red-400',    emoji: '❤️', label: 'Connections' },
  soul:          { gradient: 'from-violet-500 to-purple-400',bg: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-400', emoji: '✨', label: 'Soul' },
}

const PRIORITY_CONFIG = {
  1: { dot: 'bg-red-400',    label: 'urgent',  pulse: true },
  2: { dot: 'bg-amber-400',  label: 'soon',    pulse: false },
  3: { dot: 'bg-emerald-400',label: 'later',   pulse: false },
}

export default function QuestCard({ quest, showDelete = false }) {
  const completeQuest = useAppStore((s) => s.completeQuest)
  const deleteQuest   = useAppStore((s) => s.deleteQuest)
  const [showTip, setShowTip]       = useState(false)
  const [completing, setCompleting] = useState(false)
  const [justDone, setJustDone]     = useState(false)

  const cat  = CATEGORY[quest.category] || CATEGORY.personal
  const pri  = PRIORITY_CONFIG[quest.priority] || PRIORITY_CONFIG[3]

  const handleComplete = () => {
    if (quest.completed || completing) return
    setCompleting(true)
    setTimeout(() => {
      completeQuest(quest.id)
      setCompleting(false)
      setJustDone(true)
    }, 350)
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border transition-all duration-300
      ${quest.completed
        ? 'bg-white/50 border-pink-100 opacity-60'
        : 'bg-white/90 border-pink-100/60 hover:border-pink-200 hover:-translate-y-0.5 hover:shadow-lg'}
      ${quest.category === 'soul' ? 'border-violet-200/70' : ''}
      ${justDone ? 'animate-pop' : ''}
      shadow-sm
    `}>
      {/* Category color bar — left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${cat.gradient}`}/>

      <div className="pl-4 pr-4 py-3.5 flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={quest.completed}
          className={`
            flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${quest.completed
              ? `bg-gradient-to-br ${cat.gradient} border-transparent shadow-sm`
              : `border-pink-200 hover:border-pink-400 hover:bg-pink-50 ${completing ? 'scale-125 border-pink-500 bg-pink-100' : ''}`
            }
          `}
        >
          {quest.completed && <Check size={11} className="text-white" strokeWidth={3}/>}
          {completing && !quest.completed && (
            <div className={`w-2.5 h-2.5 rounded-full ${cat.bar} animate-ping`}/>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold leading-snug ${quest.completed ? 'line-through text-rose-300' : 'text-rose-900'}`}>
              {quest.title}
            </p>

            {/* Category pill */}
            <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text} mt-0.5`}>
              {cat.emoji} {cat.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {quest.estimatedMinutes && (
              <span className="flex items-center gap-1 text-xs text-rose-400">
                <Clock size={10}/> {quest.estimatedMinutes}m
              </span>
            )}
            <span className="text-xs font-bold text-violet-500">+{quest.xp} XP</span>
            <span className="text-xs font-semibold text-amber-500">+{quest.coins} 🪙</span>

            {/* Priority indicator */}
            {quest.priority && quest.priority <= 2 && (
              <span className="flex items-center gap-1 text-xs text-rose-400 font-semibold">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${pri.dot} ${pri.pulse ? 'animate-pulse' : ''}`}/>
                {pri.label}
              </span>
            )}
          </div>

          {/* Insight (tip) — no "AI" label, just a natural hint */}
          {quest.tip && !quest.completed && (
            <div className="mt-2">
              {showTip ? (
                <p className={`text-xs leading-relaxed rounded-xl px-3 py-2 ${cat.bg} ${cat.text} border border-white/50`}>
                  {quest.tip}
                </p>
              ) : (
                <button
                  onClick={() => setShowTip(true)}
                  className="text-xs text-violet-400 hover:text-violet-600 flex items-center gap-0.5 transition-colors"
                >
                  <ChevronDown size={11}/> hint
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete */}
        {showDelete && !quest.completed && (
          <button
            onClick={() => deleteQuest(quest.id)}
            className="flex-shrink-0 p-1.5 rounded-xl hover:bg-red-50 text-rose-200 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12}/>
          </button>
        )}
      </div>
    </div>
  )
}

import { Check, Clock, Trash2, Lightbulb } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'

const CATEGORY_COLORS = {
  career:        { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   emoji: '💼' },
  work:          { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   emoji: '🔧' },
  health:        { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  emoji: '🌿' },
  learning:      { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  emoji: '📚' },
  personal:      { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200',   emoji: '🌸' },
  relationships: { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    emoji: '❤️' },
  soul:          { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', emoji: '✨' },
}

export default function QuestCard({ quest, showDelete = false }) {
  const completeQuest = useAppStore((s) => s.completeQuest)
  const deleteQuest   = useAppStore((s) => s.deleteQuest)
  const [showTip, setShowTip] = useState(false)
  const [completing, setCompleting] = useState(false)

  const colors = CATEGORY_COLORS[quest.category] || CATEGORY_COLORS.personal

  const handleComplete = () => {
    if (quest.completed || completing) return
    setCompleting(true)
    setTimeout(() => {
      completeQuest(quest.id)
      setCompleting(false)
    }, 400)
  }

  return (
    <div className={`quest-card animate-slide-up ${quest.completed ? 'opacity-60' : ''} ${quest.category === 'soul' ? 'ring-1 ring-purple-200' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={quest.completed}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
            quest.completed
              ? 'bg-gradient-to-br from-pink-400 to-purple-500 border-transparent'
              : `border-pink-300 hover:border-pink-500 hover:bg-pink-50 ${completing ? 'scale-110 border-pink-500' : ''}`
          }`}
        >
          {quest.completed && <Check size={13} className="text-white" strokeWidth={3} />}
          {completing && !quest.completed && <div className="w-3 h-3 rounded-full bg-pink-400 animate-pulse" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title + category */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold leading-snug ${quest.completed ? 'line-through text-pink-300' : 'text-rose-900'}`}>
              {quest.title}
            </p>
            <span className={`badge ${colors.bg} ${colors.text} flex-shrink-0 mt-0.5`}>
              {colors.emoji} {quest.category}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-pink-500">
              <Clock size={11} />
              {quest.estimatedMinutes}m
            </span>
            <span className="text-xs font-semibold text-purple-600">+{quest.xp} XP</span>
            <span className="text-xs text-amber-600">+{quest.coins} 🪙</span>
            {quest.priority === 1 && <span className="text-xs font-bold text-red-500">● Urgent</span>}
            {quest.priority === 2 && <span className="text-xs text-orange-400">● Soon</span>}
          </div>

          {/* AI tip */}
          {quest.tip && (
            <div className="mt-2">
              {showTip ? (
                <div className={`text-xs ${colors.bg} ${colors.text} rounded-xl p-2.5 leading-relaxed`}>
                  <span className="font-semibold">💡 </span>{quest.tip}
                </div>
              ) : (
                <button
                  onClick={() => setShowTip(true)}
                  className="text-xs text-purple-400 hover:text-purple-600 flex items-center gap-1"
                >
                  <Lightbulb size={11} />
                  Show AI tip
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete */}
        {showDelete && (
          <button
            onClick={() => deleteQuest(quest.id)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

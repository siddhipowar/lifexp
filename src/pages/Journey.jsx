import { useAppStore } from '../store/useAppStore'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

// ─── Milestone definitions ───────────────────────────────────────────────────
// check(data) returns true if the milestone is unlocked
const MILESTONES = [
  {
    id: 'first_quest', title: 'First Quest',       emoji: '⚔️',
    desc: 'Complete your very first quest',
    check: d => d.totalCompleted >= 1,
    xp: 0,
  },
  {
    id: 'soul_start', title: 'Soul Awakened',       emoji: '✨',
    desc: 'Complete your first soul quest',
    check: d => d.soulCompleted >= 1,
    xp: 0,
  },
  {
    id: 'habit_3', title: 'Habit Spark',             emoji: '🌱',
    desc: '3 days in a row on any habit',
    check: d => d.maxStreak >= 3,
    xp: 0,
  },
  {
    id: 'level_2', title: 'Level 2',                 emoji: '⭐',
    desc: 'Reach Level 2',
    check: d => d.level >= 2,
    xp: 0,
  },
  {
    id: 'quests_5', title: 'Quest Veteran',          emoji: '🗡️',
    desc: 'Complete 5 quests',
    check: d => d.totalCompleted >= 5,
    xp: 0,
  },
  {
    id: 'career_3', title: 'Career Moves',           emoji: '💼',
    desc: 'Complete 3 career quests',
    check: d => d.careerCompleted >= 3,
    xp: 0,
  },
  {
    id: 'habit_7', title: 'Week Warrior',            emoji: '🔥',
    desc: '7-day habit streak',
    check: d => d.maxStreak >= 7,
    xp: 0,
  },
  {
    id: 'learning_5', title: 'Knowledge Seeker',    emoji: '📚',
    desc: 'Complete 5 learning quests',
    check: d => d.learningCompleted >= 5,
    xp: 0,
  },
  {
    id: 'level_3', title: 'Level 3',                 emoji: '💫',
    desc: 'Reach Level 3',
    check: d => d.level >= 3,
    xp: 0,
  },
  {
    id: 'quests_15', title: 'Quest Master',          emoji: '🏆',
    desc: 'Complete 15 quests',
    check: d => d.totalCompleted >= 15,
    xp: 0,
  },
  {
    id: 'soul_10', title: 'Soul Builder',            emoji: '🔮',
    desc: 'Complete 10 soul quests',
    check: d => d.soulCompleted >= 10,
    xp: 0,
  },
  {
    id: 'habit_21', title: 'Iron Habit',             emoji: '💪',
    desc: '21-day habit streak',
    check: d => d.maxStreak >= 21,
    xp: 0,
  },
  {
    id: 'level_5', title: 'Level 5',                 emoji: '🌟',
    desc: 'Reach Level 5',
    check: d => d.level >= 5,
    xp: 0,
  },
  {
    id: 'quests_30', title: 'Quest Legend',          emoji: '👑',
    desc: 'Complete 30 quests',
    check: d => d.totalCompleted >= 30,
    xp: 0,
  },
  {
    id: 'habit_30', title: 'Unbreakable',            emoji: '💎',
    desc: '30-day habit streak',
    check: d => d.maxStreak >= 30,
    xp: 0,
  },
  {
    id: 'level_10', title: 'Level 10',               emoji: '🌈',
    desc: 'Reach Level 10 — multi-year achievement',
    check: d => d.level >= 10,
    xp: 0,
  },
]

// Milestone color by index (cycles)
const MILESTONE_COLORS = [
  { from: 'from-pink-400',   to: 'to-rose-500',    glow: 'rgba(244,114,182,0.5)' },
  { from: 'from-violet-400', to: 'to-purple-500',  glow: 'rgba(167,139,250,0.5)' },
  { from: 'from-sky-400',    to: 'to-blue-500',    glow: 'rgba(56,189,248,0.5)'  },
  { from: 'from-amber-400',  to: 'to-orange-500',  glow: 'rgba(251,191,36,0.5)'  },
  { from: 'from-emerald-400',to: 'to-teal-500',    glow: 'rgba(52,211,153,0.5)'  },
  { from: 'from-fuchsia-400',to: 'to-pink-500',    glow: 'rgba(232,121,249,0.5)' },
]

export default function Journey() {
  const user   = useAppStore(s => s.user)
  const quests = useAppStore(s => s.quests)
  const habits = useAppStore(s => s.habits)
  const navigate = useNavigate()

  const data = useMemo(() => {
    const completed = quests.filter(q => q.completed)
    return {
      level:            user.level,
      totalCompleted:   completed.length,
      soulCompleted:    completed.filter(q => q.category === 'soul').length,
      careerCompleted:  completed.filter(q => q.category === 'career' || q.category === 'work').length,
      learningCompleted:completed.filter(q => q.category === 'learning').length,
      healthCompleted:  completed.filter(q => q.category === 'health').length,
      maxStreak:        Math.max(0, ...habits.map(h => h.longestStreak || 0)),
    }
  }, [user.level, quests, habits])

  const milestones = MILESTONES.map((m, i) => ({
    ...m,
    unlocked: m.check(data),
    color:    MILESTONE_COLORS[i % MILESTONE_COLORS.length],
  }))

  const unlockedCount = milestones.filter(m => m.unlocked).length
  const nextMilestone = milestones.find(m => !m.unlocked)
  const progress      = Math.round((unlockedCount / milestones.length) * 100)

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-950">Journey</h1>
          <p className="text-sm text-rose-500 mt-1">
            {unlockedCount} / {milestones.length} milestones · {progress}% complete
          </p>
        </div>
        <button
          onClick={() => navigate('/app/guide')}
          className="flex items-center gap-1.5 text-xs font-semibold bg-violet-100 text-violet-700 px-3 py-2 rounded-xl hover:bg-violet-200 transition-colors"
        >
          <MessageCircle size={13}/> Ask AI
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next milestone callout */}
      {nextMilestone && (
        <div className="card p-4 flex items-center gap-3 border border-purple-100/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl flex-shrink-0">
            {nextMilestone.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">next milestone</p>
            <p className="text-sm font-bold text-rose-900">{nextMilestone.title}</p>
            <p className="text-xs text-rose-400">{nextMilestone.desc}</p>
          </div>
        </div>
      )}

      {/* Milestone path */}
      <div className="relative">
        {milestones.map((m, i) => {
          const isLeft  = i % 2 === 0
          const isLast  = i === milestones.length - 1
          const isCurrent = m.unlocked && (!milestones[i + 1]?.unlocked)

          return (
            <div key={m.id} className="relative">
              {/* Connector line to next */}
              {!isLast && (
                <div
                  className={`absolute w-0.5 ${m.unlocked ? 'bg-gradient-to-b from-pink-300 to-purple-200' : 'bg-pink-100'}`}
                  style={{
                    left: isLeft ? '28px' : 'calc(100% - 29px)',
                    top: '56px',
                    height: '40px',
                    zIndex: 0,
                  }}
                />
              )}

              {/* Milestone row */}
              <div
                className={`flex items-center gap-3 mb-2 relative z-10 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Node */}
                <div
                  className={`
                    flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
                    transition-all duration-300
                    ${m.unlocked
                      ? `bg-gradient-to-br ${m.color.from} ${m.color.to} shadow-lg`
                      : 'bg-pink-50 border-2 border-dashed border-pink-200'
                    }
                    ${isCurrent ? 'scale-110 ring-4 ring-purple-200' : ''}
                  `}
                  style={isCurrent ? { boxShadow: `0 0 20px ${m.color.glow}` } : undefined}
                >
                  {m.unlocked ? m.emoji : '🔒'}
                </div>

                {/* Info card */}
                <div
                  className={`
                    flex-1 card px-3 py-2.5 min-w-0
                    ${m.unlocked ? '' : 'opacity-50'}
                    ${isCurrent ? 'border-purple-200 bg-purple-50/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-bold leading-tight ${m.unlocked ? 'text-rose-900' : 'text-rose-400'}`}>
                      {m.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                        current ✦
                      </span>
                    )}
                    {m.unlocked && !isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                        ✓ done
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${m.unlocked ? 'text-rose-500' : 'text-rose-300'}`}>
                    {m.desc}
                  </p>
                </div>
              </div>

              {/* Zigzag spacer */}
              <div className="h-3"/>
            </div>
          )
        })}
      </div>

      {/* Completed all */}
      {unlockedCount === milestones.length && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3 animate-float">🌈</p>
          <p className="font-display text-xl font-bold text-rose-950 mb-1">You did it all.</p>
          <p className="text-sm text-rose-500">Every milestone unlocked. You're a LifeXP legend.</p>
        </div>
      )}
    </div>
  )
}

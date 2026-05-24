import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { callClaudeJSON } from '../lib/claude'
import { ONBOARDING_SYSTEM } from '../lib/prompts'
import { ArrowRight, ArrowLeft, Sparkles, Loader } from 'lucide-react'

const QUESTIONS = [
  {
    id: 'name',
    question: "First, what's your name?",
    placeholder: 'Your first name...',
    type: 'text',
    subtitle: 'This is your game. Let\'s make it feel like yours.'
  },
  {
    id: 'situation',
    question: "What's your life situation right now?",
    placeholder: 'Where are you, what are you working on, what\'s on your plate...',
    type: 'textarea',
    subtitle: 'No right answer. Just be honest.'
  },
  {
    id: 'goals',
    question: "What are your top 3 goals right now?",
    placeholder: 'Career goal, personal goal, something you keep putting off...',
    type: 'textarea',
    subtitle: 'What would make this year feel like a win?'
  },
  {
    id: 'struggle',
    question: "What\'s your biggest struggle?",
    placeholder: 'Overwhelm? Relationships? Consistency? Self-doubt?',
    type: 'textarea',
    subtitle: 'The more honest you are, the better the AI can help.'
  },
  {
    id: 'relationships',
    question: "How do relationships affect you?",
    placeholder: 'Do you lose yourself when you like someone? Struggle with boundaries? Feel empty without validation?',
    type: 'textarea',
    subtitle: 'This is a safe space. Your answers shape your Soul System.'
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const setQuests = useAppStore((s) => s.setQuests)
  const setHabits = useAppStore((s) => s.setHabits)
  const addSoulEntry = useAppStore((s) => s.addSoulEntry)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const current = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1
  const canNext = answers[current?.id]?.trim?.()?.length > 0

  const handleNext = async () => {
    if (!canNext) return
    if (!isLast) { setStep(s => s + 1); return }

    // Final step — call Claude
    setLoading(true)
    setError(null)
    try {
      const prompt = QUESTIONS.map(q => `${q.question}\n${answers[q.id] || ''}`).join('\n\n')
      const data = await callClaudeJSON({
        system: ONBOARDING_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1200,
      })
      setResult(data)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  const handleBegin = () => {
    if (!result) return
    const name = answers.name || 'Signal Ranger'
    setOnboardingComplete(name, result.suggestedAnchors || [])
    setQuests([
      ...result.starterQuests.map(q => ({ ...q, completed: false })),
      ...(result.soulQuest ? [{
        id: 'soul_onboarding',
        title: result.soulQuest.title,
        category: 'soul',
        xp: result.soulQuest.xp,
        coins: result.soulQuest.coins || 5,
        priority: 1,
        estimatedMinutes: 20,
        scheduledDay: 'today',
        parentGoal: 'Daily soul work',
        tip: result.soulQuest.description,
        completed: false,
      }] : [])
    ])
    if (result.habits) setHabits(result.habits.map(h => ({
      ...h,
      id: Date.now().toString() + Math.random(),
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
    })))
    navigate('/app/dashboard')
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-screen bg-cozy-gradient cozy-pattern flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-float">⭐</div>
            <h1 className="font-display text-3xl font-black text-rose-950 mb-2">Your character is ready.</h1>
            <p className="text-rose-600">{answers.name}, meet your new guide.</p>
          </div>

          <div className="card p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {answers.name?.[0] || 'S'}
              </div>
              <div>
                <p className="font-bold text-rose-900">{answers.name}</p>
                <p className="text-sm text-purple-600">🌟 {result.avatarClass} · Level 1</p>
              </div>
            </div>
            <p className="text-sm text-rose-700 leading-relaxed italic mb-4">"{result.characterSummary}"</p>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
              <p className="text-sm font-semibold text-purple-800">✨ {result.encouragement}</p>
            </div>
          </div>

          <div className="card p-5 mb-4">
            <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">Your first quests</p>
            {result.starterQuests?.slice(0, 3).map(q => (
              <div key={q.id} className="flex items-center gap-3 py-2 border-b border-pink-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-900">{q.title}</p>
                </div>
                <span className="text-xs text-purple-500">+{q.xp} XP</span>
              </div>
            ))}
          </div>

          {result.soulQuest && (
            <div className="bg-soul-gradient rounded-3xl p-5 mb-4 border border-purple-100">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Your daily soul quest</p>
              <p className="text-sm font-semibold text-purple-900">{result.soulQuest.title}</p>
              <p className="text-xs text-purple-700 mt-1">{result.soulQuest.description}</p>
            </div>
          )}

          <button onClick={handleBegin} className="btn-primary w-full text-base py-4">
            Enter LifeXP ✨
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cozy-gradient cozy-pattern flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-pink-400 to-purple-500' : 'bg-pink-100'}`}
            />
          ))}
        </div>

        <div className="card p-8 animate-slide-up">
          <div className="text-4xl mb-4 animate-float">
            {['✨', '🌟', '🎯', '💪', '💜'][step]}
          </div>
          <h2 className="font-display text-2xl font-bold text-rose-950 mb-2">{current.question}</h2>
          <p className="text-sm text-rose-500 mb-6">{current.subtitle}</p>

          {current.type === 'text' ? (
            <input
              type="text"
              value={answers[current.id] || ''}
              onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              placeholder={current.placeholder}
              className="input-cozy mb-6"
              onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
              autoFocus
            />
          ) : (
            <textarea
              rows={4}
              value={answers[current.id] || ''}
              onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              placeholder={current.placeholder}
              className="textarea-cozy mb-6"
              autoFocus
            />
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3 mb-4">{error}</p>}

          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost p-3">
                <ArrowLeft size={18} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canNext || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Creating your character...</>
              ) : isLast ? (
                <><Sparkles size={16} /> Create My Character</>
              ) : (
                <>Next <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-pink-400 mt-6">Step {step + 1} of {QUESTIONS.length}</p>
      </div>
    </div>
  )
}

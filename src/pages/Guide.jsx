import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { callClaude } from '../lib/claude'
import { GUIDE_SYSTEM } from '../lib/prompts'
import { Send, Loader, Sparkles } from 'lucide-react'

const QUICK_PROMPTS = [
  { label: '😵 I feel overwhelmed', value: 'I feel completely overwhelmed right now. What is the one thing I should do?' },
  { label: '📅 Plan my week', value: 'Help me plan my week. Look at my quests and suggest a realistic weekly schedule.' },
  { label: '💔 Feeling dependent', value: "I'm feeling emotionally dependent on someone and I know it's not good. Help me ground myself." },
  { label: '💼 Job search help', value: 'I need motivation and tactical advice for my AV/robotics job search. What should I focus on right now?' },
  { label: '🌸 Be my hype person', value: 'I need you to remind me who I am and what I\'m capable of. Be direct and honest.' },
]

export default function Guide() {
  const user = useAppStore((s) => s.user)
  const quests = useAppStore((s) => s.quests)
  const guideMessages = useAppStore((s) => s.guideMessages)
  const addMessage = useAppStore((s) => s.addMessage)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [guideMessages, loading])

  const send = async (text = input) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setError(null)
    addMessage('user', userMsg)
    setLoading(true)

    try {
      const recentMood = user.moodToday
      const history = guideMessages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const response = await callClaude({
        system: GUIDE_SYSTEM(user, quests, recentMood),
        messages: [...history, { role: 'user', content: userMsg }],
        maxTokens: 400,
      })
      addMessage('assistant', response)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold text-rose-950">AI Guide</h1>
        <p className="text-sm text-rose-500 mt-1">Your personal life guide — honest, warm, no fluff.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-cozy space-y-4 mb-4 pr-1">
        {guideMessages.length === 0 && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-soul-gradient rounded-3xl p-6 border border-purple-100 text-center">
              <div className="text-4xl mb-3 animate-float">💜</div>
              <h2 className="font-display text-xl font-bold text-purple-900 mb-2">Hi, {user.name?.split(' ')[0]}.</h2>
              <p className="text-sm text-purple-700 leading-relaxed">
                I'm your AI guide. I know your quests, your goals, and what you're working through.
                I won't give you a list of 10 things. I'll give you one clear thing.
              </p>
            </div>

            {/* Quick prompts */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wider px-1">Quick prompts:</p>
              {QUICK_PROMPTS.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => send(qp.value)}
                  className="w-full text-left card-glow px-4 py-3 text-sm font-medium text-rose-800 hover:text-pink-700 transition-all"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {guideMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-0.5">
                ✨
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-br-lg'
                  : 'bg-white/90 text-rose-900 shadow-card rounded-bl-lg border border-pink-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">
              ✨
            </div>
            <div className="bg-white/90 rounded-3xl rounded-bl-lg px-4 py-3 shadow-card border border-pink-100">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce-soft" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Talk to your guide..."
          className="input-cozy flex-1"
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn-primary p-3 flex-shrink-0"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}

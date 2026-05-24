import { useNavigate } from 'react-router-dom'
import { Sparkles, Heart, Zap, Star, Shield, BookOpen, Calendar, ShoppingBag } from 'lucide-react'

const features = [
  { icon: '⚔️', title: 'Quest Board', desc: 'AI breaks your goals into winnable daily quests — no more frozen overwhelm.' },
  { icon: '✨', title: 'Soul System', desc: 'Track and break relationship dependency patterns. Become your own main character.' },
  { icon: '💬', title: 'AI Guide', desc: 'Your personal coach for overwhelm, career, and relationships. Always in your corner.' },
  { icon: '🪙', title: 'Reward Shop', desc: 'Spend coins on real treats you\'ve earned. Coffee dates, spa days, sushi nights.' },
  { icon: '🌸', title: 'Habit Engine', desc: 'Streaks, XP multipliers, daily rituals. Build the version of you that shows up.' },
  { icon: '📅', title: 'Calendar AI', desc: 'Tell it your plan in plain English. It schedules everything for you.' },
]

const problems = [
  { emoji: '😵', headline: 'Too many things', sub: 'You freeze and do nothing. Then feel guilty. Then do even less.' },
  { emoji: '💔', headline: 'You lose yourself', sub: 'When you get attached to someone, your goals quietly disappear.' },
  { emoji: '📋', headline: 'No system that sticks', sub: 'You\'ve tried apps, planners, alarms. None of them get you.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cozy-gradient cozy-pattern font-body overflow-x-hidden">
      {/* Floating orbs */}
      <div className="fixed w-72 h-72 rounded-full bg-pink-200/20 blur-3xl -top-20 -left-20 animate-float pointer-events-none" />
      <div className="fixed w-96 h-96 rounded-full bg-purple-200/15 blur-3xl top-1/2 -right-32 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="fixed w-64 h-64 rounded-full bg-peach-200/15 blur-3xl bottom-20 left-1/3 animate-float pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Nav */}
      <nav className="glass border-b border-pink-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-sparkle">✨</span>
            <span className="font-display text-xl font-bold text-gradient">LifeXP</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="#features" className="nav-link">Features</a>
            <a href="#soul" className="nav-link">Soul System</a>
            <a href="#how" className="nav-link">How It Works</a>
          </div>
          <button
            onClick={() => navigate('/app/onboarding')}
            className="btn-primary text-sm"
          >
            Start Your Quest ✨
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center relative">
        <div className="inline-flex items-center gap-2 bg-white/70 border border-pink-200 rounded-full px-4 py-1.5 text-xs font-semibold text-pink-600 mb-8 shadow-sm animate-bounce-soft">
          <Sparkles size={12} />
          Your life, gamified beautifully
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-black text-rose-950 leading-tight mb-6">
          Your life is{' '}
          <span className="text-gradient">the game.</span>
          <br />
          <em>Start playing it.</em>
        </h1>

        <p className="text-lg md:text-xl text-rose-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          Turn your chaos into quests. Let AI be your personal guide.
          Level up your career, your habits, and <em>yourself</em> — for real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/app/onboarding')}
            className="btn-primary text-base px-8 py-4"
          >
            Begin Your Quest ✨
          </button>
          <a href="#how" className="btn-ghost text-base px-8 py-4 text-center">
            See how it works
          </a>
        </div>

        {/* Floating quest preview cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { emoji: '💼', title: 'Apply to Waymo', xp: 150, coins: 15, cat: 'career', cat_color: 'bg-blue-100 text-blue-700' },
            { emoji: '✨', title: 'Do one thing just for you', xp: 50, coins: 5, cat: 'soul', cat_color: 'bg-purple-100 text-purple-700' },
            { emoji: '🌿', title: 'Go for a 20-min walk', xp: 40, coins: 4, cat: 'health', cat_color: 'bg-green-100 text-green-700' },
          ].map((q) => (
            <div key={q.title} className="card-glow p-4 animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
              <div className="flex items-center justify-between mb-2">
                <span className={`badge text-xs ${q.cat_color}`}>{q.emoji} {q.cat}</span>
                <span className="text-xs text-purple-500 font-semibold">+{q.xp} XP</span>
              </div>
              <p className="text-sm font-semibold text-rose-900">{q.title}</p>
              <p className="text-xs text-amber-500 mt-1">+{q.coins} 🪙</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem section */}
      <section className="bg-white/50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-rose-950 mb-4">
            You're not lazy. You're just overwhelmed.
          </h2>
          <p className="text-rose-600 mb-12 text-lg">And nobody built a tool that actually understands that.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p) => (
              <div key={p.headline} className="card p-6 text-left">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-display text-lg font-bold text-rose-900 mb-2">{p.headline}</h3>
                <p className="text-sm text-rose-600 leading-relaxed">{p.sub}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-xl font-semibold text-gradient">LifeXP changes all of that.</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-rose-950 mb-4">How it works</h2>
          <p className="text-center text-rose-600 mb-14">Three steps. No overwhelm.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', emoji: '🧠', title: 'Dump everything', desc: 'Open the Master Document and pour out everything on your mind. Jobs, relationships, habits, fears, goals. Nothing is too small or too big.' },
              { step: '02', emoji: '✨', title: 'AI takes command', desc: 'The AI reads your chaos and turns it into prioritized quests, a weekly plan, and tells you what to drop. It\'s honest, not generic.' },
              { step: '03', emoji: '⚔️', title: 'You just play', desc: 'Complete quests, earn XP, build streaks, level up. Watch your actual stats grow. Treat yourself from the reward shop.' },
            ].map((item) => (
              <div key={item.step} className="card-glow p-7 text-center">
                <div className="text-4xl mb-4 animate-float">{item.emoji}</div>
                <p className="text-xs font-bold text-pink-400 mb-2 tracking-widest">{item.step}</p>
                <h3 className="font-display text-lg font-bold text-rose-900 mb-3">{item.title}</h3>
                <p className="text-sm text-rose-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white/40 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center text-rose-950 mb-14">Everything you need to level up</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card-glow p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-rose-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-rose-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Soul system spotlight */}
      <section id="soul" className="py-24 px-6 bg-soul-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6 animate-float">💜</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-purple-900 mb-6">
            Stop losing yourself.<br />
            <em>Start becoming yourself.</em>
          </h2>
          <p className="text-purple-700 text-lg mb-10 leading-relaxed">
            LifeXP's Soul System was built for one specific thing: helping you stay <em>you</em>
            {' '}when a relationship tries to erase you. Not a therapy app. Not a journal.
            A system with teeth.
          </p>
          <div className="grid md:grid-cols-3 gap-5 text-left mb-10">
            {[
              { emoji: '🪞', title: 'Identity Anchors', desc: 'Define who you are outside of any relationship. These live on your homepage — your north star.' },
              { emoji: '⚖️', title: 'Bond Balance Meter', desc: 'Track daily: how much energy went to yourself vs. one person? Watch the trend. Notice the patterns.' },
              { emoji: '📓', title: 'Pattern Tracker', desc: 'Log dependency moments. The AI reflects them back weekly — not to shame you, to free you.' },
            ].map((item) => (
              <div key={item.title} className="bg-white/60 rounded-3xl p-5 border border-purple-100">
                <div className="text-2xl mb-3">{item.emoji}</div>
                <h4 className="font-semibold text-purple-900 mb-1.5">{item.title}</h4>
                <p className="text-sm text-purple-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-purple-800 font-bold text-lg italic">
            "You are not someone's emotional support animal. You are a main character."
          </p>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6 animate-sparkle">✨</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-rose-950 mb-6">Your quest starts now.</h2>
          <p className="text-rose-600 mb-10 text-lg leading-relaxed">
            Built for the ones who have everything to do and the courage to start.
          </p>
          <button
            onClick={() => navigate('/app/onboarding')}
            className="btn-primary text-lg px-10 py-4"
          >
            Begin Your Quest ✨
          </button>
          <p className="mt-6 text-sm text-pink-400">Free to start. No credit card. Just you.</p>
        </div>
      </section>
    </div>
  )
}

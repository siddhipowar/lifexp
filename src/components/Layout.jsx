import { Outlet, NavLink } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Home, Sword, Sparkles, Heart, MessageCircle, FileText, ShoppingBag, User, CalendarDays, Menu, X } from 'lucide-react'
import { useState } from 'react'
import XPBar from './XPBar'
import ImpulseCheck from './ImpulseCheck'
import { getLevelTitle } from '../lib/levelTitle'

const navItems = [
  { to: '/app/dashboard', icon: Home,          label: 'Home',     color: 'from-rose-400 to-pink-500',      iconBg: 'bg-rose-50    text-rose-500' },
  { to: '/app/quests',    icon: Sword,          label: 'Quests',   color: 'from-orange-400 to-rose-500',    iconBg: 'bg-orange-50  text-orange-500' },
  { to: '/app/habits',    icon: Sparkles,       label: 'Habits',   color: 'from-violet-400 to-purple-500',  iconBg: 'bg-violet-50  text-violet-500' },
  { to: '/app/soul',      icon: Heart,          label: 'Soul',     color: 'from-purple-400 to-fuchsia-500', iconBg: 'bg-purple-50  text-purple-500' },
  { to: '/app/guide',     icon: MessageCircle,  label: 'Guide',    color: 'from-sky-400 to-blue-500',       iconBg: 'bg-sky-50     text-sky-500' },
  { to: '/app/my-life',   icon: FileText,       label: 'My Life',  color: 'from-amber-400 to-orange-500',   iconBg: 'bg-amber-50   text-amber-500' },
  { to: '/app/calendar',  icon: CalendarDays,   label: 'Calendar', color: 'from-teal-400 to-cyan-500',      iconBg: 'bg-teal-50    text-teal-500' },
  { to: '/app/shop',      icon: ShoppingBag,    label: 'Shop',     color: 'from-yellow-400 to-amber-500',   iconBg: 'bg-yellow-50  text-yellow-600' },
  { to: '/app/profile',   icon: User,           label: 'Profile',  color: 'from-pink-400 to-rose-500',      iconBg: 'bg-pink-50    text-pink-500' },
]

export default function Layout() {
  const user     = useAppStore((s) => s.user)
  const quests   = useAppStore((s) => s.quests)
  const xpNeeded = useAppStore((s) => s.xpNeeded)()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [impulseOpen, setImpulseOpen] = useState(false)

  const xpPct = Math.round((user.xp / xpNeeded) * 100)

  return (
    <div className="min-h-screen flex bg-cozy-gradient cozy-pattern">

      {/* Ambient orbs */}
      <div className="orb w-80 h-80 bg-pink-200/25   top-0    -left-24" style={{ animationDelay: '0s' }}/>
      <div className="orb w-96 h-96 bg-purple-200/20 bottom-0 -right-24" style={{ animationDelay: '3s' }}/>
      <div className="orb w-64 h-64 bg-fuchsia-100/20 top-1/2 left-1/3" style={{ animationDelay: '6s' }}/>

      {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-30"
        style={{
          background: 'linear-gradient(165deg, rgba(255,250,254,0.97) 0%, rgba(250,244,255,0.97) 50%, rgba(255,244,250,0.97) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(240,160,210,0.18)',
          boxShadow: '4px 0 32px rgba(200,80,150,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-sm">✨</span>
            </div>
            <span className="font-display text-2xl font-black text-gradient tracking-tight">LifeXP</span>
          </div>
        </div>

        {/* User card */}
        <div className="mx-4 mb-5 rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,244,255,0.9))', border: '1px solid rgba(220,160,220,0.2)' }}
        >
          {/* Gradient header strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400"/>
          <div className="p-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md">
                  {user.name?.[0] || 'S'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-black text-white">{user.level}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-rose-900 truncate leading-tight">{user.name}</p>
                <p className="text-xs text-purple-500 truncate">{getLevelTitle(user.level, user.stats, quests)}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-black text-amber-500">🪙{user.coins}</p>
              </div>
            </div>

            {/* XP bar */}
            <XPBar xp={user.xp} needed={xpNeeded}/>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-pink-400">{user.xp} XP</span>
              <span className="text-[10px] text-purple-400">{xpPct}% to Lv {user.level + 1}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1 px-3">
          {navItems.map(({ to, icon: Icon, label, color, iconBg }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              {({ isActive }) => (
                <>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${color} shadow-sm`
                      : iconBg
                  }`}>
                    <Icon size={14} className={isActive ? 'text-white' : ''}/>
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="text-[11px] text-center text-pink-300/80 font-medium italic py-5 px-4">
          you are a main character ✦
        </p>
      </aside>

      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255,250,254,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(240,160,210,0.15)',
          boxShadow: '0 1px 20px rgba(200,80,150,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <span className="text-[10px]">✨</span>
          </div>
          <span className="font-display text-lg font-black text-gradient">LifeXP</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1 border border-pink-100">
            <span className="text-xs font-bold text-purple-600">Lv {user.level}</span>
            <span className="w-px h-3 bg-pink-200"/>
            <span className="text-xs font-bold text-amber-500">🪙 {user.coins}</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/80 border border-pink-100 text-pink-500 hover:bg-pink-50 transition-colors"
          >
            {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col animate-fade-in"
          style={{ background: 'rgba(255,250,254,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-pink-100">
            <span className="font-display text-xl font-black text-gradient">LifeXP</span>
            <button onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-pink-50 text-pink-500"
            >
              <X size={16}/>
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label, color, iconBg }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? `bg-gradient-to-br ${color} shadow-sm` : iconBg
                    }`}>
                      <Icon size={15} className={isActive ? 'text-white' : ''}/>
                    </div>
                    <span className="text-sm font-semibold">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
          <Outlet/>
        </div>
      </main>

      {/* Impulse Check floating button */}
      <button
        onClick={() => setImpulseOpen(true)}
        title="Impulse Check"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-6 z-40 w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
          boxShadow: '0 4px 20px rgba(244,63,94,0.4), 0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        🚨
      </button>

      {impulseOpen && <ImpulseCheck onClose={() => setImpulseOpen(false)}/>}

      {/* ── Mobile bottom nav — floating pill ─────────────────────── */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-30 flex justify-around items-center py-2 px-2 rounded-3xl"
        style={{
          background: 'rgba(255,250,254,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(240,160,210,0.2)',
          boxShadow: '0 8px 32px rgba(200,80,150,0.15), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {navItems.slice(0, 5).map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-2xl transition-all ${
                isActive ? 'scale-110' : 'opacity-60 hover:opacity-80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? `bg-gradient-to-br ${color} shadow-md` : 'bg-transparent'
                }`}>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-rose-400'}/>
                </div>
                <span className={`text-[9px] font-bold ${isActive ? 'text-rose-600' : 'text-rose-300'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}


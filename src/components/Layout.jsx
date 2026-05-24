import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Home, Sword, Sparkles, Heart, MessageCircle, FileText, ShoppingBag, User, CalendarDays, Menu, X } from 'lucide-react'
import { useState } from 'react'
import XPBar from './XPBar'

const navItems = [
  { to: '/app/dashboard', icon: Home,          label: 'Home' },
  { to: '/app/quests',    icon: Sword,          label: 'Quests' },
  { to: '/app/habits',    icon: Sparkles,       label: 'Habits' },
  { to: '/app/soul',      icon: Heart,          label: 'Soul' },
  { to: '/app/guide',     icon: MessageCircle,  label: 'Guide' },
  { to: '/app/my-life',   icon: FileText,       label: 'My Life' },
  { to: '/app/calendar',  icon: CalendarDays,   label: 'Calendar' },
  { to: '/app/shop',      icon: ShoppingBag,    label: 'Shop' },
  { to: '/app/profile',   icon: User,           label: 'Profile' },
]

export default function Layout() {
  const user = useAppStore((s) => s.user)
  const xpNeeded = useAppStore((s) => s.xpNeeded)()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-cozy-gradient cozy-pattern">
      {/* Floating orbs */}
      <div className="orb w-64 h-64 bg-pink-200/30 top-10 -left-20" style={{ animationDelay: '0s' }} />
      <div className="orb w-96 h-96 bg-purple-200/20 bottom-20 -right-20" style={{ animationDelay: '3s' }} />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen glass border-r border-pink-100 fixed left-0 top-0 z-30 py-6 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <span className="text-2xl animate-sparkle">✨</span>
          <span className="font-display text-xl font-bold text-gradient">LifeXP</span>
        </div>

        {/* User mini card */}
        <div className="card p-3 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.[0] || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-900 truncate">{user.name}</p>
              <p className="text-xs text-purple-500">Lv {user.level} · {getLevelTitle(user.level)}</p>
            </div>
          </div>
          <XPBar xp={user.xp} needed={xpNeeded} />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-pink-400">{user.xp} XP</span>
            <span className="text-xs text-purple-400">🪙 {user.coins}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 shadow-sm'
                    : 'text-rose-700 hover:bg-pink-50 hover:text-pink-600'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="text-xs text-center text-pink-300 mt-6">You are a main character ✨</p>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-pink-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-display text-lg font-bold text-gradient">LifeXP</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-purple-600">Lv {user.level} · 🪙 {user.coins}</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-pink-100 text-pink-600">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col p-6 pt-16 animate-fade-in">
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-pink-100 text-pink-700' : 'text-rose-700 hover:bg-pink-50'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-pink-100 flex justify-around py-2 px-2">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'text-pink-600' : 'text-rose-400'
              }`
            }
          >
            <Icon size={18} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function getLevelTitle(level) {
  if (level <= 3) return 'Signal Apprentice'
  if (level <= 6) return 'LiDAR Ranger'
  if (level <= 10) return 'Sensor Mage'
  if (level <= 15) return 'Quantum Engineer'
  return 'Architect of Worlds'
}

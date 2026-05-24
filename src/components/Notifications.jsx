import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function Notifications() {
  const notifications = useAppStore((s) => s.notifications)
  const clearNotification = useAppStore((s) => s.clearNotification)

  useEffect(() => {
    notifications.forEach((n) => {
      const timer = setTimeout(() => clearNotification(n.id), 3500)
      return () => clearTimeout(timer)
    })
  }, [notifications, clearNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="animate-pop pointer-events-auto"
          onClick={() => clearNotification(n.id)}
        >
          {n.type === 'levelup' ? (
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-3 rounded-2xl shadow-glow-purple flex items-center gap-3 max-w-xs">
              <span className="text-2xl animate-sparkle">⭐</span>
              <div>
                <p className="font-bold text-sm">Level Up!</p>
                <p className="text-xs opacity-90">{n.message}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur border border-pink-100 shadow-cozy px-4 py-3 rounded-2xl flex items-center gap-3 max-w-xs">
              <span className="text-lg">✨</span>
              <div>
                <p className="text-xs font-bold text-rose-900 leading-tight">{n.questTitle}</p>
                <p className="text-xs text-purple-600 font-semibold">{n.message}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

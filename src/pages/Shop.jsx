import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { ShoppingBag, Plus, Check, Lock } from 'lucide-react'

export default function Shop() {
  const user = useAppStore((s) => s.user)
  const shopItems = useAppStore((s) => s.shopItems)
  const redeemShopItem = useAppStore((s) => s.redeemShopItem)
  const addShopItem = useAppStore((s) => s.addShopItem)

  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', cost: 50, emoji: '🎀' })
  const [justRedeemed, setJustRedeemed] = useState(null)

  const handleRedeem = (id) => {
    const item = shopItems.find(i => i.id === id)
    if (!item || user.coins < item.cost || item.redeemed) return
    redeemShopItem(id)
    setJustRedeemed(id)
    setTimeout(() => setJustRedeemed(null), 2000)
  }

  const handleAdd = () => {
    if (!newItem.name.trim()) return
    addShopItem(newItem)
    setNewItem({ name: '', cost: 50, emoji: '🎀' })
    setShowAdd(false)
  }

  const available = shopItems.filter(i => !i.redeemed)
  const redeemed = shopItems.filter(i => i.redeemed)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-rose-950">Reward Shop</h1>
          <p className="text-sm text-rose-500 mt-1">You've earned these. Spend wisely. 🪙</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2.5">
          <Plus size={15} />
          Add Reward
        </button>
      </div>

      {/* Coins display */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-2xl shadow-sm">
          🪙
        </div>
        <div>
          <p className="font-display text-3xl font-black text-amber-600">{user.coins}</p>
          <p className="text-sm text-rose-500">coins available</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-rose-400">Level {user.level} · {user.xp} XP earned</p>
          <p className="text-xs text-purple-400 mt-0.5">500 XP = ~50 🪙</p>
        </div>
      </div>

      {/* Add item form */}
      {showAdd && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-rose-900 mb-4">Add Custom Reward</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🎀"
                value={newItem.emoji}
                onChange={e => setNewItem(i => ({ ...i, emoji: e.target.value }))}
                className="input-cozy w-16 text-center text-xl"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="Reward name..."
                value={newItem.name}
                onChange={e => setNewItem(i => ({ ...i, name: e.target.value }))}
                className="input-cozy flex-1"
              />
            </div>
            <div>
              <label className="text-xs text-rose-500 mb-1 block">Cost in coins: {newItem.cost} 🪙</label>
              <input
                type="range"
                min={10} max={500} step={10}
                value={newItem.cost}
                onChange={e => setNewItem(i => ({ ...i, cost: +e.target.value }))}
                className="w-full accent-pink-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="btn-primary text-sm flex-1">Add Reward ✨</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Available rewards */}
      <div>
        <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3">Available Rewards</p>
        <div className="grid grid-cols-2 gap-3">
          {available.map(item => {
            const canAfford = user.coins >= item.cost
            const isRedeemed = justRedeemed === item.id

            return (
              <div
                key={item.id}
                className={`card-glow p-5 text-center transition-all ${!canAfford ? 'opacity-60' : 'cursor-pointer hover:shadow-cozy-lg'} ${isRedeemed ? 'ring-2 ring-green-300 bg-green-50/50' : ''}`}
              >
                <div className="text-3xl mb-2 animate-float">{item.emoji}</div>
                <p className="text-sm font-semibold text-rose-900 leading-tight mb-2">{item.name}</p>
                <p className="text-sm font-black text-amber-500 mb-3">🪙 {item.cost}</p>

                {isRedeemed ? (
                  <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold">
                    <Check size={14} /> Redeemed!
                  </div>
                ) : canAfford ? (
                  <button onClick={() => handleRedeem(item.id)} className="btn-primary text-xs px-4 py-2 w-full">
                    Redeem ✨
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-rose-300 text-xs">
                    <Lock size={12} />
                    Need {item.cost - user.coins} more
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Redeemed history */}
      {redeemed.length > 0 && (
        <div>
          <p className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-3">Already claimed</p>
          <div className="space-y-2">
            {redeemed.map(item => (
              <div key={item.id} className="flex items-center gap-3 card px-4 py-3 opacity-50">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm text-rose-600 flex-1 line-through">{item.name}</span>
                <span className="text-xs text-rose-400">🪙 {item.cost}</span>
                <Check size={14} className="text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earning tips */}
      <div className="card p-4">
        <p className="text-xs font-bold text-purple-400 mb-3">How to earn coins faster 🪙</p>
        <div className="space-y-1.5 text-xs text-rose-600">
          <p>⚔️ Boss quest (job application) = 15 🪙</p>
          <p>✨ Soul quest = 5 🪙</p>
          <p>🔥 7-day streak bonus = 20 🪙</p>
          <p>⭐ Level up bonus = 50 🪙</p>
        </div>
      </div>
    </div>
  )
}

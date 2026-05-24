import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// XP needed to level up from level n
// At ~170 XP/day average (3 quests + 3 habits, ~70% consistency):
//   Lv 1→2 : 30,000 XP ≈ 6 months
//   Lv 2→3 : 39,000 XP ≈ 8 months
//   Lv 3→4 : 51,000 XP ≈ 10 months
//   Lv 4→5 : 66,000 XP ≈ 13 months (just over a year)
//   Lv 5+  : keeps scaling — reaching Lv 10 is a multi-year achievement
const LEVEL_XP = (n) => Math.floor(30000 * Math.pow(1.3, n - 1))

const defaultUser = {
  name: 'Signal Ranger',
  avatarClass: 'Signal Ranger',
  level: 1,
  xp: 0,
  coins: 50,
  stats: { intelligence: 10, ambition: 10, discipline: 10, soul: 10, resilience: 10, connection: 10 },
  masterDocument: '',
  onboardingComplete: false,
  moodToday: null,
  lastMoodDate: null,
  identityAnchors: [],
  streakDays: 0,
  lastActiveDate: null,
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      user: defaultUser,
      quests: [],
      habits: [],
      calendarEvents: [],
      soulEntries: [],
      dailySummaries: [],   // { date, plannedMinutes, completedMinutes, completedCount, totalCount, missedTitles }
      shopItems: [
        { id: 'coffee',   name: 'Coffee date with yourself ☕', cost: 20,  emoji: '☕', redeemed: false },
        { id: 'movie',    name: 'Movie night 🎬',               cost: 40,  emoji: '🎬', redeemed: false },
        { id: 'book',     name: 'New book 📚',                  cost: 60,  emoji: '📚', redeemed: false },
        { id: 'sushi',    name: 'Sushi night 🍣',               cost: 80,  emoji: '🍣', redeemed: false },
        { id: 'spa',      name: 'Spa day 💆',                   cost: 150, emoji: '💆', redeemed: false },
        { id: 'skincare', name: 'New skincare item 🌸',         cost: 100, emoji: '🌸', redeemed: false },
        { id: 'nails',    name: 'Nail appointment 💅',          cost: 90,  emoji: '💅', redeemed: false },
      ],
      guideMessages: [],
      notifications: [],
      impulseChecks: [],

      // ─── Daily reset (call on app load) ───────────────────────────────────────
      checkDailyReset: () => {
        const s = get()
        const today = new Date().toISOString().split('T')[0]
        const lastActive = s.user.lastActiveDate

        // Nothing to do if we already ran today or no prior date
        if (!lastActive || lastActive === today) {
          // Just update lastActiveDate to today
          set((s) => ({ user: { ...s.user, lastActiveDate: today } }))
          return
        }

        // A new day has arrived — snapshot yesterday's performance
        const yesterday = lastActive
        const todayQuests = s.quests.filter(q =>
          !q.completed && (q.scheduledDay === 'today' || q.scheduledDay === 'tomorrow')
        )
        const allYesterdayQuests = s.quests.filter(q =>
          q.scheduledDay === 'today' || q.scheduledDay === 'tomorrow' ||
          (q.completedAt && q.completedAt.startsWith(yesterday))
        )
        const completedYesterday = s.quests.filter(q =>
          q.completed && q.completedAt && q.completedAt.startsWith(yesterday)
        )
        const missedQuests = s.quests.filter(q =>
          !q.completed && (q.scheduledDay === 'today' || q.scheduledDay === 'tomorrow')
        )

        const plannedMinutes   = missedQuests.reduce((sum, q) => sum + (q.estimatedMinutes || 0), 0)
                               + completedYesterday.reduce((sum, q) => sum + (q.estimatedMinutes || 0), 0)
        const completedMinutes = completedYesterday.reduce((sum, q) => sum + (q.estimatedMinutes || 0), 0)

        const summary = {
          date: yesterday,
          plannedMinutes,
          completedMinutes,
          missedMinutes: plannedMinutes - completedMinutes,
          completedCount: completedYesterday.length,
          totalCount: completedYesterday.length + missedQuests.length,
          missedTitles: missedQuests.map(q => q.title),
          completionRate: plannedMinutes > 0
            ? Math.round((completedMinutes / plannedMinutes) * 100)
            : 100,
        }

        // Roll over incomplete quests: today → tomorrow, tomorrow → this_week
        const updatedQuests = s.quests.map(q => {
          if (q.completed) return q
          if (q.scheduledDay === 'today')     return { ...q, scheduledDay: 'tomorrow' }
          if (q.scheduledDay === 'tomorrow')  return { ...q, scheduledDay: 'this_week' }
          return q
        })

        set((s) => ({
          quests: updatedQuests,
          dailySummaries: [summary, ...s.dailySummaries].slice(0, 90), // keep 90 days
          user: { ...s.user, lastActiveDate: today },
        }))
      },

      // ─── User ─────────────────────────────────────────────────────────────────
      setOnboardingComplete: (name, anchors) => set((s) => ({
        user: { ...s.user, name, onboardingComplete: true, identityAnchors: anchors, lastActiveDate: new Date().toISOString().split('T')[0] }
      })),

      updateMasterDocument: (text) => set((s) => ({ user: { ...s.user, masterDocument: text } })),

      setMoodToday: (mood) => set((s) => ({
        user: { ...s.user, moodToday: mood, lastMoodDate: new Date().toISOString().split('T')[0] }
      })),

      addXP: (amount, stat) => set((s) => {
        const newXP    = s.user.xp + amount
        const xpNeeded = LEVEL_XP(s.user.level)
        const leveledUp = newXP >= xpNeeded
        const newLevel  = leveledUp ? s.user.level + 1 : s.user.level
        const finalXP   = leveledUp ? newXP - xpNeeded : newXP
        const newStats  = stat
          ? { ...s.user.stats, [stat]: Math.min(100, (s.user.stats[stat] || 0) + Math.floor(amount / 10)) }
          : s.user.stats
        const notification = leveledUp
          ? { id: Date.now(), type: 'levelup', message: `Level Up! You're now Level ${newLevel} ✨`, level: newLevel }
          : null
        return {
          user: { ...s.user, xp: finalXP, level: newLevel, stats: newStats },
          notifications: notification ? [...s.notifications, notification] : s.notifications,
        }
      }),

      addCoins: (amount) => set((s) => ({ user: { ...s.user, coins: s.user.coins + amount } })),

      xpNeeded: () => LEVEL_XP(get().user.level),

      // ─── Quests ───────────────────────────────────────────────────────────────
      setQuests: (quests) => set({ quests }),

      addQuest: (quest) => set((s) => ({
        quests: [...s.quests, { ...quest, id: quest.id || Date.now().toString(), completed: false, createdAt: new Date().toISOString() }]
      })),

      completeQuest: (id) => set((s) => {
        const quest = s.quests.find((q) => q.id === id)
        if (!quest || quest.completed) return s
        const xpMap = { soul: 'soul', career: 'ambition', learning: 'intelligence', health: 'discipline', work: 'ambition', personal: 'resilience', relationships: 'connection' }
        const notification = { id: Date.now(), type: 'xp', message: `+${quest.xp} XP ✨ +${quest.coins} 🪙`, questTitle: quest.title }
        const newXP     = s.user.xp + quest.xp
        const xpNeeded  = LEVEL_XP(s.user.level)
        const leveledUp = newXP >= xpNeeded
        return {
          quests: s.quests.map((q) => q.id === id ? { ...q, completed: true, completedAt: new Date().toISOString() } : q),
          user: {
            ...s.user,
            xp:    leveledUp ? newXP - xpNeeded : newXP,
            level: leveledUp ? s.user.level + 1 : s.user.level,
            coins: s.user.coins + quest.coins,
            stats: { ...s.user.stats, [xpMap[quest.category] || 'resilience']: Math.min(100, (s.user.stats[xpMap[quest.category] || 'resilience'] || 0) + Math.floor(quest.xp / 10)) }
          },
          notifications: [...s.notifications, notification],
        }
      }),

      deleteQuest: (id) => set((s) => ({ quests: s.quests.filter((q) => q.id !== id) })),

      // ─── Habits ───────────────────────────────────────────────────────────────
      setHabits:    (habits) => set({ habits }),
      deleteHabit:  (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      addHabit: (habit) => set((s) => ({
        habits: [...s.habits, { ...habit, id: Date.now().toString(), currentStreak: 0, longestStreak: 0, completedDates: [] }]
      })),

      toggleHabit: (id) => set((s) => {
        const today = new Date().toISOString().split('T')[0]
        return {
          habits: s.habits.map((h) => {
            if (h.id !== id) return h
            const alreadyDone = h.completedDates.includes(today)
            if (alreadyDone) {
              return { ...h, completedDates: h.completedDates.filter((d) => d !== today), currentStreak: Math.max(0, h.currentStreak - 1) }
            }
            const newStreak = h.currentStreak + 1
            return { ...h, completedDates: [...h.completedDates, today], currentStreak: newStreak, longestStreak: Math.max(h.longestStreak, newStreak) }
          }),
        }
      }),

      // ─── Soul ─────────────────────────────────────────────────────────────────
      addSoulEntry: (entry) => set((s) => ({
        soulEntries: [...s.soulEntries, { ...entry, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] }]
      })),

      updateIdentityAnchors: (anchors) => set((s) => ({ user: { ...s.user, identityAnchors: anchors } })),

      // ─── Calendar ─────────────────────────────────────────────────────────────
      addCalendarEvent:    (event) => set((s) => ({ calendarEvents: [...s.calendarEvents, { ...event, id: Date.now().toString() }] })),
      deleteCalendarEvent: (id)    => set((s) => ({ calendarEvents: s.calendarEvents.filter((e) => e.id !== id) })),

      // ─── Shop ─────────────────────────────────────────────────────────────────
      redeemShopItem: (id) => set((s) => {
        const item = s.shopItems.find((i) => i.id === id)
        if (!item || s.user.coins < item.cost) return s
        return {
          shopItems: s.shopItems.map((i) => i.id === id ? { ...i, redeemed: true, redeemedAt: new Date().toISOString() } : i),
          user: { ...s.user, coins: s.user.coins - item.cost },
        }
      }),

      addShopItem: (item) => set((s) => ({
        shopItems: [...s.shopItems, { ...item, id: Date.now().toString(), redeemed: false }]
      })),

      // ─── Guide ────────────────────────────────────────────────────────────────
      addMessage: (role, content) => set((s) => ({
        guideMessages: [...s.guideMessages, { id: Date.now().toString(), role, content, timestamp: new Date().toISOString() }]
      })),

      // ─── Impulse Checks ───────────────────────────────────────────────────────
      addImpulseCheck: (check) => set((s) => ({
        impulseChecks: [{ ...check, id: Date.now().toString(), timestamp: new Date().toISOString() }, ...s.impulseChecks].slice(0, 50)
      })),

      // ─── Notifications ────────────────────────────────────────────────────────
      clearNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      resetOnboarding: () => set({ user: defaultUser }),
    }),
    {
      name: 'lifexp-store',
      version: 2,
      migrate: (saved, fromVersion) => {
        // Always merge saved state with current defaults — never wipe
        return {
          ...saved,
          user: { ...defaultUser, ...saved.user },
          quests:         saved.quests         ?? [],
          habits:         saved.habits         ?? [],
          calendarEvents: saved.calendarEvents ?? [],
          soulEntries:    saved.soulEntries    ?? [],
          dailySummaries: saved.dailySummaries ?? [],
          impulseChecks:  saved.impulseChecks  ?? [],
          shopItems:      saved.shopItems      ?? [],
          guideMessages:  saved.guideMessages  ?? [],
          notifications:  saved.notifications  ?? [],
        }
      },
    }
  )
)

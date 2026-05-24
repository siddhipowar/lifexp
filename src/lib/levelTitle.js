// Dynamic level title — reflects what the user has actually worked on
// Uses completed quest categories + current level to generate a meaningful title

// Each stat maps to a progression of titles across 5 tiers (level 1-3, 4-6, 7-9, 10-12, 13+)
const ARCHETYPES = {
  ambition: [
    'Ambitious Starter',
    'Path Maker',
    'Career Forger',
    'Trailblazer',
    'Architect of Goals',
  ],
  intelligence: [
    'Curious Mind',
    'Knowledge Seeker',
    'Pattern Reader',
    'Deep Thinker',
    'Signal Sage',
  ],
  soul: [
    'Soul Stirring',
    'Inner Explorer',
    'Heart Keeper',
    'Soul Alchemist',
    'Luminous One',
  ],
  discipline: [
    'Habit Builder',
    'Daily Ritualist',
    'Iron Consistent',
    'Discipline Forged',
    'Unbreakable',
  ],
  resilience: [
    'Quietly Rising',
    'Getting Stronger',
    'Standing Firm',
    'Phoenix Rising',
    'Sovereign Self',
  ],
  connection: [
    'Open Hearted',
    'Bond Builder',
    'Deep Connector',
    'Empathy Forged',
    'Heart Leader',
  ],
}

// When no quests have been completed yet
const EARLY_TITLES = [
  'Just Beginning',
  'Taking First Steps',
  'Finding the Path',
  'Stepping Forward',
  'Awakening',
]

// Map quest category → stat key (mirrors the store's xpMap)
const CATEGORY_TO_STAT = {
  soul:          'soul',
  career:        'ambition',
  work:          'ambition',
  learning:      'intelligence',
  health:        'discipline',
  personal:      'resilience',
  relationships: 'connection',
}

/**
 * Returns a title based on what the user has actually completed.
 *
 * @param {number} level        - current user level
 * @param {object} stats        - user.stats object
 * @param {array}  quests       - full quests array (to count completions by category)
 */
export function getLevelTitle(level, stats = {}, quests = []) {
  // Count completed quests per stat bucket
  const counts = { ambition: 0, intelligence: 0, soul: 0, discipline: 0, resilience: 0, connection: 0 }

  quests.forEach(q => {
    if (!q.completed) return
    const stat = CATEGORY_TO_STAT[q.category]
    if (stat) counts[stat]++
  })

  // Also factor in stats that moved above default (10) via addXP calls
  Object.entries(stats).forEach(([key, val]) => {
    if (key in counts && val > 10) {
      counts[key] += Math.floor((val - 10) / 5) // weight stat movement
    }
  })

  const total = Object.values(counts).reduce((s, v) => s + v, 0)

  // No meaningful history yet → generic early title
  if (total < 3) {
    return EARLY_TITLES[Math.min(level - 1, EARLY_TITLES.length - 1)]
  }

  // Find the dominant area
  const topStat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]

  // Tier based on level: 0-4
  const tier = Math.min(4, Math.floor((level - 1) / 3))

  return ARCHETYPES[topStat][tier]
}

/**
 * Smart quest ranking — picks what to do RIGHT NOW based on:
 *   • Time of day (energy curve: morning = deep work, afternoon = execution,
 *                  evening = personal/soul, night = wind-down only)
 *   • Quest priority (1=urgent, 2=soon, 3=later)
 *   • Category fit for current time slot
 *   • Mood (low energy → lighter tasks, fewer quests)
 *   • Quest duration (short tasks score higher when energy is low)
 *   • Whether it's scheduled for today vs later in the week
 */

export const TIME_SLOT = {
  MORNING:   'morning',    // 06:30 – 11:59
  AFTERNOON: 'afternoon',  // 12:00 – 16:59
  EVENING:   'evening',    // 17:00 – 20:59
  NIGHT:     'night',      // 21:00 – 06:29
}

export function getTimeSlot(hour = new Date().getHours(), minute = new Date().getMinutes()) {
  const time = hour + minute / 60
  if (time >= 6.5  && time < 12) return TIME_SLOT.MORNING
  if (time >= 12   && time < 17) return TIME_SLOT.AFTERNOON
  if (time >= 17   && time < 21) return TIME_SLOT.EVENING
  return TIME_SLOT.NIGHT
}

export const SLOT_LABELS = {
  morning:   { label: 'morning focus',      emoji: '🌅', sub: 'peak brain — deep work first' },
  afternoon: { label: 'afternoon grind',    emoji: '⚡', sub: 'execution mode — knock things out' },
  evening:   { label: 'evening wind-down',  emoji: '🌇', sub: 'lighter tasks, recharge' },
  night:     { label: 'night mode',         emoji: '🌙', sub: 'reflect, rest, prepare' },
}

// How well each category fits each time slot  (0–40 bonus points)
const CATEGORY_FIT = {
  morning:   { career: 35, learning: 35, work: 30, health: 25, personal: 10, relationships: 5,  soul: 15 },
  afternoon: { work: 35,   career: 30,   learning: 20, personal: 15, relationships: 15, health: 20, soul: 10 },
  evening:   { personal: 35, relationships: 35, soul: 30, health: 25, learning: 15, work: 5,  career: 0  },
  night:     { soul: 40,  personal: 30,  relationships: 20, health: 10, learning: 5,  work: -20, career: -20 },
}

// Priority → base score
const PRIORITY_SCORE = { 1: 100, 2: 55, 3: 20 }

// Schedule urgency bonus
const SCHEDULE_SCORE = { today: 20, tomorrow: 5, this_week: 0, next_week: -10 }

/**
 * Returns quests sorted by "do now" score, with a `_reason` string on each.
 * @param {Array}  quests  - all incomplete quests
 * @param {number} mood    - 1–5, null if not set
 * @param {string} slot    - TIME_SLOT value
 * @returns {Array} sorted quests with _score and _reason added
 */
export function rankQuests(quests, mood = 3, slot = getTimeSlot()) {
  const effectiveMood = mood ?? 3
  const fitMap = CATEGORY_FIT[slot] || CATEGORY_FIT.afternoon

  const scored = quests
    .filter(q => !q.completed)
    .map(q => {
      let score = PRIORITY_SCORE[q.priority] || 20

      // Category–time fit
      const fit = fitMap[q.category] ?? 10
      score += fit

      // Schedule urgency
      score += SCHEDULE_SCORE[q.scheduledDay] ?? 0

      // Short task bonus — easier to start when energy is low
      const mins = q.estimatedMinutes || 30
      if (mins <= 20) score += 12
      else if (mins <= 45) score += 6

      // Mood adjustments
      if (effectiveMood <= 2) {
        // Drained / low — favour short, light tasks; penalise heavy career work
        if (mins > 60)                               score -= 20
        if (q.category === 'career' || q.category === 'work') score -= 15
        if (q.category === 'soul' || q.category === 'personal') score += 15
        if (mins <= 30)                              score += 10
      } else if (effectiveMood >= 4) {
        // High energy — favour ambitious tasks
        if (q.category === 'career' || q.category === 'learning') score += 10
        if (q.priority === 1)                        score += 10
      }

      // Build a short human reason string
      const reason = buildReason(q, fit, slot, effectiveMood)

      return { ...q, _score: score, _reason: reason }
    })
    .sort((a, b) => b._score - a._score)

  return scored
}

/**
 * Returns the top N quests to show on Dashboard for "do now".
 * Caps at 1 if mood is very low, 3 otherwise.
 */
export function getDoNowQuests(quests, mood, slot, max = 3) {
  const effectiveMood = mood ?? 3
  const cap = effectiveMood <= 2 ? 1 : max
  return rankQuests(quests.filter(q => !q.completed), mood, slot).slice(0, cap)
}

// ─── Internal helpers ──────────────────────────────────────────────────────

const FIT_LABELS = {
  morning:   { high: 'best for morning',   low: 'not ideal now' },
  afternoon: { high: 'good afternoon task', low: 'better later' },
  evening:   { high: 'perfect for evening', low: 'save for morning' },
  night:     { high: 'good wind-down',      low: 'too heavy for now' },
}

function buildReason(quest, fit, slot, mood) {
  const parts = []

  if (quest.priority === 1)           parts.push('🔴 urgent')
  if (quest.scheduledDay === 'today') parts.push('due today')

  if (fit >= 30) {
    parts.push(FIT_LABELS[slot]?.high || 'good fit')
  } else if (fit <= 0) {
    parts.push(FIT_LABELS[slot]?.low || 'off-peak')
  }

  if (mood <= 2 && (quest.estimatedMinutes || 30) <= 30) parts.push('quick win')
  if (mood >= 4 && quest.priority === 1)                 parts.push('high energy match')

  return parts.slice(0, 2).join(' · ') || 'up next'
}

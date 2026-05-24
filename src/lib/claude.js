// Claude API via local proxy (api/claude)
// In dev: calls /api/claude (Vite proxy) → server.js
// In prod: calls /api/claude route

export async function callClaude({ system, messages, maxTokens = 500 }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export async function callClaudeJSON({ system, messages, maxTokens = 1000 }) {
  const text = await callClaude({ system, messages, maxTokens })
  try {
    // strip any accidental markdown fences
    const clean = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error('Failed to parse Claude JSON:', text)
    throw new Error('AI returned invalid JSON. Please try again.')
  }
}

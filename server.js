import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Groq from 'groq-sdk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env
try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...rest] = line.split('=')
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim()
  })
} catch {}

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.post('/api/claude', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not set in .env' })
    }

    const { system, messages, max_tokens } = req.body

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: max_tokens || 500,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages,
      ],
    })

    const text = response.choices[0]?.message?.content || ''

    // Return in same format the frontend expects
    res.json({
      content: [{ type: 'text', text }],
      model: 'llama-3.3-70b-versatile',
    })
  } catch (err) {
    console.error('Groq API error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✨ LifeXP API server running on http://localhost:${PORT} (powered by Groq / Llama 3.3)`)
})

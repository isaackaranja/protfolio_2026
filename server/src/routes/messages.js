import { Router } from 'express'
import { messages } from '../db.js'

export const router = Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Returns an error message, or null when the input is valid
function validate({ name, email, message }) {
  if (!name || name.length > 100) return 'Please enter your name (up to 100 characters).'
  if (!EMAIL_PATTERN.test(email) || email.length > 200) return 'Please enter a valid email address.'
  if (!message || message.length > 5000) return 'Please enter a message (up to 5000 characters).'
  return null
}

// POST /api/messages — save a message sent from the contact form
router.post('/', async (req, res) => {
  const body = req.body ?? {}
  const input = {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim(),
    message: String(body.message ?? '').trim(),
  }

  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const { insertedId } = await messages.insertOne({ ...input, createdAt: new Date() })
  res.status(201).json({ id: insertedId })
})

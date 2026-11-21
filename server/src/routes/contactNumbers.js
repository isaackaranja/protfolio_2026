import { Router } from 'express'
import { contactNumbers, parseId } from '../db.js'

export const router = Router()

const FIELDS = {
  label: { label: 'Label', max: 40, required: true },
  number: { label: 'Number', max: 30, required: true },
}

const NOT_FOUND = 'Contact number not found'

// Digits with optional +, spaces, dashes, dots and brackets, e.g. +254 712 345 678
function isPhoneNumber(value) {
  return /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 7
}

// Picks the allowed fields from the request body. With partial, missing fields are skipped (for PATCH).
function readInput(body = {}, { partial = false } = {}) {
  const input = {}
  for (const field of Object.keys(FIELDS)) {
    if (!partial || body[field] !== undefined) input[field] = String(body[field] ?? '').trim()
  }
  return input
}

// Returns an error message, or null when the input is valid
function validate(input) {
  for (const [field, { label, max, required }] of Object.entries(FIELDS)) {
    if (!(field in input)) continue
    if (required && !input[field]) return `${label} is required (up to ${max} characters).`
    if (input[field].length > max) return `${label} must be up to ${max} characters.`
  }
  if ('number' in input && !isPhoneNumber(input.number)) {
    return 'Enter a phone number with at least 7 digits, e.g. +254 712 345 678.'
  }
  return null
}

// GET /api/contact-numbers — list all, in the order they were added
router.get('/', async (req, res) => {
  const docs = await contactNumbers.find().sort({ createdAt: 1 }).toArray()
  res.json(docs)
})

// POST /api/contact-numbers — create
router.post('/', async (req, res) => {
  const input = readInput(req.body)
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const now = new Date()
  const doc = { ...input, createdAt: now, updatedAt: now }
  const { insertedId } = await contactNumbers.insertOne(doc)
  res.status(201).json({ _id: insertedId, ...doc })
})

// PATCH /api/contact-numbers/:id — update the fields that were sent
router.patch('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  if (!_id) return res.status(404).json({ error: NOT_FOUND })

  const input = readInput(req.body, { partial: true })
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const doc = await contactNumbers.findOneAndUpdate(
    { _id },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!doc) return res.status(404).json({ error: NOT_FOUND })
  res.json(doc)
})

// DELETE /api/contact-numbers/:id — destroy
router.delete('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const { deletedCount } = _id ? await contactNumbers.deleteOne({ _id }) : { deletedCount: 0 }
  if (!deletedCount) return res.status(404).json({ error: NOT_FOUND })
  res.status(204).end()
})

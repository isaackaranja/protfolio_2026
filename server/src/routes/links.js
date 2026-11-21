import { Router } from 'express'
import { links, parseId } from '../db.js'

export const router = Router()

const FIELDS = {
  linkName: { label: 'Name', max: 60, required: true },
  link: { label: 'Link', max: 2000, required: true },
  description: { label: 'Description', max: 300 },
}

const NOT_FOUND = 'Link not found'

// Links go straight into the page, so only web and email links are allowed:
// a "javascript:" link would run code when clicked.
function isSafeLink(value) {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
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
  if ('link' in input && !isSafeLink(input.link)) {
    return 'Link must start with https://, http:// or mailto:'
  }
  return null
}

// GET /api/links — list all, in the order they were added
router.get('/', async (req, res) => {
  const docs = await links.find().sort({ createdAt: 1 }).toArray()
  res.json(docs)
})

// POST /api/links — create
router.post('/', async (req, res) => {
  const input = readInput(req.body)
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const now = new Date()
  const doc = { ...input, createdAt: now, updatedAt: now }
  const { insertedId } = await links.insertOne(doc)
  res.status(201).json({ _id: insertedId, ...doc })
})

// PATCH /api/links/:id — update the fields that were sent
router.patch('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  if (!_id) return res.status(404).json({ error: NOT_FOUND })

  const input = readInput(req.body, { partial: true })
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const doc = await links.findOneAndUpdate(
    { _id },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!doc) return res.status(404).json({ error: NOT_FOUND })
  res.json(doc)
})

// DELETE /api/links/:id — destroy
router.delete('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const { deletedCount } = _id ? await links.deleteOne({ _id }) : { deletedCount: 0 }
  if (!deletedCount) return res.status(404).json({ error: NOT_FOUND })
  res.status(204).end()
})

import { Router } from 'express'
import { caseInsensitive, parseId, skills } from '../db.js'

export const router = Router()

const FIELDS = {
  name: { label: 'Name', max: 60 },
  category: { label: 'Category', max: 60 },
}

const DUPLICATE_ERROR = 'That skill or tool already exists.'

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
  for (const [field, { label, max }] of Object.entries(FIELDS)) {
    if (field in input && (!input[field] || input[field].length > max)) {
      return `${label} is required (up to ${max} characters).`
    }
  }
  return null
}

// MongoDB's error code when the unique index on name rejects a write
function isDuplicate(err) {
  return err?.code === 11000
}

// GET /api/skills — list all, grouped by category then name (A–Z)
router.get('/', async (req, res) => {
  const docs = await skills
    .find()
    .sort({ category: 1, name: 1 })
    .collation(caseInsensitive)
    .toArray()
  res.json(docs)
})

// POST /api/skills — create
router.post('/', async (req, res) => {
  const input = readInput(req.body)
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const now = new Date()
  const doc = { ...input, createdAt: now, updatedAt: now }
  try {
    const { insertedId } = await skills.insertOne(doc)
    res.status(201).json({ _id: insertedId, ...doc })
  } catch (err) {
    if (isDuplicate(err)) return res.status(409).json({ error: DUPLICATE_ERROR })
    throw err
  }
})

// PATCH /api/skills/:id — update the fields that were sent
router.patch('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  if (!_id) return res.status(404).json({ error: 'Skill not found' })

  const input = readInput(req.body, { partial: true })
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  try {
    const doc = await skills.findOneAndUpdate(
      { _id },
      { $set: { ...input, updatedAt: new Date() } },
      { returnDocument: 'after' },
    )
    if (!doc) return res.status(404).json({ error: 'Skill not found' })
    res.json(doc)
  } catch (err) {
    if (isDuplicate(err)) return res.status(409).json({ error: DUPLICATE_ERROR })
    throw err
  }
})

// DELETE /api/skills/:id — destroy
router.delete('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const { deletedCount } = _id ? await skills.deleteOne({ _id }) : { deletedCount: 0 }
  if (!deletedCount) return res.status(404).json({ error: 'Skill not found' })
  res.status(204).end()
})

import { Router } from 'express'
import { experience, parseId } from '../db.js'

export const router = Router()

// Text fields: the label used in error messages and the maximum length
const TEXT_FIELDS = {
  title: { label: 'Job title', max: 100, required: true },
  company: { label: 'Company', max: 100, required: true },
  location: { label: 'Location', max: 100 },
  description: { label: 'Description', max: 5000 },
}

// Dates are months like "2024-03". An empty endDate means the job is current.
const DATE_FIELDS = ['startDate', 'endDate']
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

// Picks the allowed fields from the request body. With partial, missing fields are skipped (for PATCH).
function readInput(body = {}, { partial = false } = {}) {
  const input = {}
  for (const field of [...Object.keys(TEXT_FIELDS), ...DATE_FIELDS]) {
    if (!partial || body[field] !== undefined) input[field] = String(body[field] ?? '').trim()
  }
  return input
}

// Returns an error message, or null when the input is valid.
// existing is the stored entry on PATCH, so a lone startDate or endDate can be checked against the other.
function validate(input, existing = {}) {
  for (const [field, { label, max, required }] of Object.entries(TEXT_FIELDS)) {
    if (!(field in input)) continue
    if (required && !input[field]) return `${label} is required (up to ${max} characters).`
    if (input[field].length > max) return `${label} must be up to ${max} characters.`
  }
  if ('startDate' in input && !MONTH.test(input.startDate)) {
    return 'Start date is required, as a month like 2024-03.'
  }
  if ('endDate' in input && input.endDate && !MONTH.test(input.endDate)) {
    return 'End date must be a month like 2024-03, or empty for a current role.'
  }
  const { startDate, endDate } = { ...existing, ...input }
  // Months in YYYY-MM form sort correctly as plain strings
  if (endDate && startDate && endDate < startDate) return 'End date must be after the start date.'
  return null
}

// GET /api/experience — list all, most recent start first
router.get('/', async (req, res) => {
  const docs = await experience.find().sort({ startDate: -1, createdAt: -1 }).toArray()
  res.json(docs)
})

// POST /api/experience — create
router.post('/', async (req, res) => {
  const input = readInput(req.body)
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const now = new Date()
  const doc = { ...input, createdAt: now, updatedAt: now }
  const { insertedId } = await experience.insertOne(doc)
  res.status(201).json({ _id: insertedId, ...doc })
})

// PATCH /api/experience/:id — update the fields that were sent
router.patch('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const existing = _id && (await experience.findOne({ _id }))
  if (!existing) return res.status(404).json({ error: 'Experience entry not found' })

  const input = readInput(req.body, { partial: true })
  const error = validate(input, existing)
  if (error) return res.status(400).json({ error })

  const doc = await experience.findOneAndUpdate(
    { _id },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!doc) return res.status(404).json({ error: 'Experience entry not found' })
  res.json(doc)
})

// DELETE /api/experience/:id — destroy
router.delete('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const { deletedCount } = _id ? await experience.deleteOne({ _id }) : { deletedCount: 0 }
  if (!deletedCount) return res.status(404).json({ error: 'Experience entry not found' })
  res.status(204).end()
})

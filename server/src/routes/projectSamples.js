import { Router } from 'express'
import { parseId, projectSamples } from '../db.js'

export const router = Router()

// Text fields: the label used in error messages and the maximum length
const TEXT_FIELDS = {
  name: { label: 'Name', max: 100, required: true },
  description: { label: 'Description', max: 2000 },
  working: { label: 'How it works', max: 5000 },
  contribution: { label: 'My contribution', max: 5000 },
  businessValue: { label: 'Business value', max: 5000 },
}

// Picks the allowed fields from the request body. With partial, missing fields are skipped (for PATCH).
function readInput(body = {}, { partial = false } = {}) {
  const input = {}
  for (const field of Object.keys(TEXT_FIELDS)) {
    if (!partial || body[field] !== undefined) input[field] = String(body[field] ?? '').trim()
  }
  if (!partial || body.images !== undefined) {
    // Drop empty entries; anything that isn't a list is kept as-is so validate can reject it
    input.images = Array.isArray(body.images)
      ? body.images.map((url) => String(url).trim()).filter(Boolean)
      : (body.images ?? [])
  }
  return input
}

// Accepts full http(s) links, or site paths like /images/app.png for files in the Vue public/ folder
function isImageUrl(url) {
  if (url.length > 2000) return false
  if (url.startsWith('/') && !url.startsWith('//')) return true
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol)
  } catch {
    return false
  }
}

// Returns an error message, or null when the input is valid
function validate(input) {
  for (const [field, { label, max, required }] of Object.entries(TEXT_FIELDS)) {
    if (!(field in input)) continue
    if (required && !input[field]) return `${label} is required (up to ${max} characters).`
    if (input[field].length > max) return `${label} must be up to ${max} characters.`
  }
  if (
    'images' in input &&
    (!Array.isArray(input.images) || input.images.length > 10 || !input.images.every(isImageUrl))
  ) {
    return 'Images must be up to 10 links starting with http://, https:// or /.'
  }
  return null
}

// GET /api/project-samples — list all, newest first
router.get('/', async (req, res) => {
  const docs = await projectSamples.find().sort({ createdAt: -1 }).toArray()
  res.json(docs)
})

// GET /api/project-samples/:id — show one
router.get('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const doc = _id && (await projectSamples.findOne({ _id }))
  if (!doc) return res.status(404).json({ error: 'Project sample not found' })
  res.json(doc)
})

// POST /api/project-samples — create
router.post('/', async (req, res) => {
  const input = readInput(req.body)
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const now = new Date()
  const doc = { ...input, createdAt: now, updatedAt: now }
  const { insertedId } = await projectSamples.insertOne(doc)
  res.status(201).json({ _id: insertedId, ...doc })
})

// PATCH /api/project-samples/:id — update the fields that were sent
router.patch('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  if (!_id) return res.status(404).json({ error: 'Project sample not found' })

  const input = readInput(req.body, { partial: true })
  const error = validate(input)
  if (error) return res.status(400).json({ error })

  const doc = await projectSamples.findOneAndUpdate(
    { _id },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!doc) return res.status(404).json({ error: 'Project sample not found' })
  res.json(doc)
})

// DELETE /api/project-samples/:id — destroy
router.delete('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const { deletedCount } = _id ? await projectSamples.deleteOne({ _id }) : { deletedCount: 0 }
  if (!deletedCount) return res.status(404).json({ error: 'Project sample not found' })
  res.status(204).end()
})

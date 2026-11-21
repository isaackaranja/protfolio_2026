import { Router, raw } from 'express'
import { requireAdmin } from '../auth.js'
import { documentFiles, documents, parseId } from '../db.js'
import { detectType, sendFile, storeFile } from '../files.js'

export const router = Router()

const KINDS = ['cv', 'coverLetter']
const MAX_BYTES = 10 * 1024 * 1024

// Allowed file types, recognised by their first bytes rather than trusting the file name
const FILE_TYPES = [
  { extension: '.pdf', contentType: 'application/pdf', signature: '%PDF-' },
  {
    extension: '.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    signature: 'PK',
  },
]

const TEXT_FIELDS = {
  label: { label: 'Version name', max: 100, required: true },
  notes: { label: 'Notes', max: 500 },
}

const NOT_FOUND = 'Document not found'

// Picks the allowed text fields. With partial, missing fields are skipped (for PATCH).
function readText(source = {}, { partial = false } = {}) {
  const input = {}
  for (const field of Object.keys(TEXT_FIELDS)) {
    if (!partial || source[field] !== undefined) input[field] = String(source[field] ?? '').trim()
  }
  return input
}

// Returns an error message, or null when the input is valid
function validateText(input) {
  for (const [field, { label, max, required }] of Object.entries(TEXT_FIELDS)) {
    if (!(field in input)) continue
    if (required && !input[field]) return `${label} is required (up to ${max} characters).`
    if (input[field].length > max) return `${label} must be up to ${max} characters.`
  }
  return null
}

// Keeps file names safe to send back in a download header
function cleanFilename(name) {
  return String(name ?? '').replace(/[\\/"\r\n]/g, '').trim().slice(0, 150)
}

// The file's contents must match its extension
function detectFileType(filename, bytes) {
  const type = detectType(bytes, FILE_TYPES)
  return type && filename.toLowerCase().endsWith(type.extension) ? type : null
}

// Public: the CV marked for the homepage. Everything else in this file needs the admin login.

// GET /api/documents/public — what the homepage can link to
router.get('/public', async (req, res) => {
  const cv = await documents.findOne({ kind: 'cv', isPublic: true })
  res.json({
    cv: cv && { filename: cv.filename, contentType: cv.contentType, updatedAt: cv.updatedAt },
  })
})

// GET /api/documents/public/cv — the homepage CV file
router.get('/public/cv', async (req, res) => {
  const cv = await documents.findOne({ kind: 'cv', isPublic: true })
  if (!cv) return res.status(404).json({ error: 'No CV has been published yet.' })
  sendFile(res, documentFiles, cv)
})

router.use(requireAdmin)

// GET /api/documents — list all versions, newest first
router.get('/', async (req, res) => {
  const docs = await documents.find().sort({ createdAt: -1 }).toArray()
  res.json(docs)
})

// GET /api/documents/:id/file — download one version
router.get('/:id/file', async (req, res) => {
  const _id = parseId(req.params.id)
  const doc = _id && (await documents.findOne({ _id }))
  if (!doc) return res.status(404).json({ error: NOT_FOUND })
  sendFile(res, documentFiles, doc, { disposition: 'attachment' })
})

// POST /api/documents?kind=cv&label=…&notes=…&filename=… — upload a version.
// The request body is the file itself, so no form-data library is needed.
router.post('/', raw({ type: () => true, limit: MAX_BYTES }), async (req, res) => {
  const kind = String(req.query.kind ?? '')
  if (!KINDS.includes(kind)) return res.status(400).json({ error: 'Choose CV or cover letter.' })

  const input = readText(req.query)
  const error = validateText(input)
  if (error) return res.status(400).json({ error })

  const filename = cleanFilename(req.query.filename)
  const bytes = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0)
  if (!bytes.length) return res.status(400).json({ error: 'Choose a file to upload.' })
  const type = filename && detectFileType(filename, bytes)
  if (!type) return res.status(400).json({ error: 'Upload a PDF or Word (.docx) file.' })

  const fileId = await storeFile(documentFiles, filename, bytes, type.contentType)

  // The first CV goes on the homepage automatically
  const isPublic = kind === 'cv' && !(await documents.findOne({ kind: 'cv', isPublic: true }))

  const now = new Date()
  const doc = {
    kind,
    ...input,
    filename,
    contentType: type.contentType,
    size: bytes.length,
    fileId,
    isPublic,
    createdAt: now,
    updatedAt: now,
  }
  const { insertedId } = await documents.insertOne(doc)
  res.status(201).json({ _id: insertedId, ...doc })
})

// PATCH /api/documents/:id — rename, edit notes, or { isPublic: true } to put a CV on the homepage
router.patch('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const existing = _id && (await documents.findOne({ _id }))
  if (!existing) return res.status(404).json({ error: NOT_FOUND })

  const input = readText(req.body, { partial: true })
  const error = validateText(input)
  if (error) return res.status(400).json({ error })

  if (req.body?.isPublic !== undefined) {
    if (existing.kind !== 'cv') {
      return res.status(400).json({ error: 'Only a CV can be shown on the homepage.' })
    }
    input.isPublic = req.body.isPublic === true
    // Only one CV is on the homepage at a time
    if (input.isPublic) await documents.updateMany({ kind: 'cv', _id: { $ne: _id } }, { $set: { isPublic: false } })
  }

  const doc = await documents.findOneAndUpdate(
    { _id },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  res.json(doc)
})

// DELETE /api/documents/:id — remove a version and its file
router.delete('/:id', async (req, res) => {
  const _id = parseId(req.params.id)
  const doc = _id && (await documents.findOneAndDelete({ _id }))
  if (!doc) return res.status(404).json({ error: NOT_FOUND })
  await documentFiles.delete(doc.fileId).catch((err) => console.error(err))
  res.status(204).end()
})

// Friendlier message than the generic one when a file is over the size limit
router.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Files must be 10 MB or smaller.' })
  }
  next(err)
})

import { Router, raw } from 'express'
import { requireAdmin } from '../auth.js'
import { imageFiles, settings } from '../db.js'
import { detectType, sendFile, storeFile } from '../files.js'

export const router = Router()

const SETTING_ID = 'profilePhoto'
const MAX_BYTES = 5 * 1024 * 1024

// Recognised by their first bytes. SVG isn't allowed: it can contain scripts.
const IMAGE_TYPES = [
  { contentType: 'image/jpeg', extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  { contentType: 'image/png', extension: 'png', signature: [0x89, 0x50, 0x4e, 0x47] },
  { contentType: 'image/webp', extension: 'webp', signature: 'WEBP', offset: 8 },
]

function currentPhoto() {
  return settings.findOne({ _id: SETTING_ID })
}

// GET /api/profile-photo — public: whether there's a photo, and when it last changed
router.get('/', async (req, res) => {
  const photo = await currentPhoto()
  res.json({ photo: photo && { updatedAt: photo.updatedAt } })
})

// GET /api/profile-photo/file — public: the image itself.
// The site adds ?v=<updatedAt> to the link, so a new photo gets a new address and caching is safe.
router.get('/file', async (req, res) => {
  const photo = await currentPhoto()
  if (!photo) return res.status(404).json({ error: 'No profile photo yet.' })
  sendFile(res, imageFiles, photo, { cacheControl: 'public, max-age=86400' })
})

// PUT /api/profile-photo — replace the photo. The request body is the image itself.
router.put('/', requireAdmin, raw({ type: () => true, limit: MAX_BYTES }), async (req, res) => {
  const bytes = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0)
  if (!bytes.length) return res.status(400).json({ error: 'Choose an image to upload.' })
  const type = detectType(bytes, IMAGE_TYPES)
  if (!type) return res.status(400).json({ error: 'Upload a JPEG, PNG or WebP image.' })

  const filename = `profile-photo.${type.extension}`
  const fileId = await storeFile(imageFiles, filename, bytes, type.contentType)
  const previous = await settings.findOneAndUpdate(
    { _id: SETTING_ID },
    {
      $set: {
        fileId,
        filename,
        contentType: type.contentType,
        size: bytes.length,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  )
  // Remove the old image only once the new one is saved
  if (previous) await imageFiles.delete(previous.fileId).catch((err) => console.error(err))

  res.json({ photo: { updatedAt: (await currentPhoto()).updatedAt } })
})

// DELETE /api/profile-photo — remove the photo (the About section shows a placeholder)
router.delete('/', requireAdmin, async (req, res) => {
  const photo = await settings.findOneAndDelete({ _id: SETTING_ID })
  if (!photo) return res.status(404).json({ error: 'No profile photo to remove.' })
  await imageFiles.delete(photo.fileId).catch((err) => console.error(err))
  res.status(204).end()
})

// Friendlier message than the generic one when an image is over the size limit
router.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Images must be 5 MB or smaller.' })
  }
  next(err)
})

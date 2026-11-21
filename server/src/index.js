import express from 'express'
import { requireAdmin, router as authRouter } from './auth.js'
import { client, connect } from './db.js'
import { router as contactNumbersRouter } from './routes/contactNumbers.js'
import { router as documentsRouter } from './routes/documents.js'
import { router as experienceRouter } from './routes/experience.js'
import { router as linksRouter } from './routes/links.js'
import { router as messagesRouter } from './routes/messages.js'
import { router as profilePhotoRouter } from './routes/profilePhoto.js'
import { router as projectSamplesRouter } from './routes/projectSamples.js'
import { router as skillsRouter } from './routes/skills.js'

const port = Number(process.env.PORT ?? 3000)

// Sites allowed to call this API from the browser, comma-separated, e.g. https://you.onrender.com.
// Not needed locally, where the site and API share an address through nginx or Vite.
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const app = express()
// Hosts like Render sit behind a proxy; this makes req.ip the visitor's address
app.set('trust proxy', 1)
app.use(express.json({ limit: '20kb' }))

app.use((req, res, next) => {
  res.vary('Origin')
  if (allowedOrigins.includes(req.get('Origin'))) {
    res.set({
      'Access-Control-Allow-Origin': req.get('Origin'),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
      'Access-Control-Max-Age': '600',
    })
  }
  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
})

// Reading content is public; changing it needs the admin password
function adminWrites(req, res, next) {
  return req.method === 'GET' ? next() : requireAdmin(req, res, next)
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
// Public: the contact form only sends messages, it can't read them
app.use('/api/messages', messagesRouter)
// Handles its own access: the homepage CV is public, everything else needs the admin login
app.use('/api/documents', documentsRouter)
// Viewing the photo is public; changing it needs the admin login (checked in the router)
app.use('/api/profile-photo', profilePhotoRouter)
app.use('/api/contact-numbers', adminWrites, contactNumbersRouter)
app.use('/api/experience', adminWrites, experienceRouter)
app.use('/api/links', adminWrites, linksRouter)
app.use('/api/project-samples', adminWrites, projectSamplesRouter)
app.use('/api/skills', adminWrites, skillsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Express 5 forwards errors thrown in async handlers here
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status ?? 500).json({ error: 'Something went wrong. Please try again.' })
})

await connect()
const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})

// Close connections cleanly when Docker stops the container
process.on('SIGTERM', () => {
  server.close(() => client.close())
})

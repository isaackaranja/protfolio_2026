import express from 'express'
import { client, connect } from './db.js'
import { router as experienceRouter } from './routes/experience.js'
import { router as messagesRouter } from './routes/messages.js'
import { router as projectSamplesRouter } from './routes/projectSamples.js'
import { router as skillsRouter } from './routes/skills.js'

const port = Number(process.env.PORT ?? 3000)

const app = express()
app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/experience', experienceRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/project-samples', projectSamplesRouter)
app.use('/api/skills', skillsRouter)

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

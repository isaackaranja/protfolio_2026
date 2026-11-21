import { MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/portfolio'

export const client = new MongoClient(uri)

// Uses the database named in the connection string ("portfolio" by default)
export const db = client.db()

export const messages = db.collection('messages')
export const projectSamples = db.collection('projectSamples')
export const skills = db.collection('skills')
export const experience = db.collection('experience')

// Compares text ignoring case, so "TypeScript" and "typescript" count as the same
export const caseInsensitive = { locale: 'en', strength: 2 }

// Turns an :id route param into an ObjectId, or null when it isn't a valid id
export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null
}

export async function connect() {
  await client.connect()
  await messages.createIndex({ createdAt: -1 })
  await projectSamples.createIndex({ createdAt: -1 })
  await skills.createIndex({ name: 1 }, { unique: true, collation: caseInsensitive })
  await experience.createIndex({ startDate: -1 })
  console.log('Connected to MongoDB')
}

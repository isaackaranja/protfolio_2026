import { GridFSBucket, MongoClient, ObjectId } from 'mongodb'

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/portfolio'

export const client = new MongoClient(uri)

// Uses the database named in the connection string ("portfolio" by default)
export const db = client.db()

export const messages = db.collection('messages')
export const projectSamples = db.collection('projectSamples')
export const skills = db.collection('skills')
export const experience = db.collection('experience')
export const links = db.collection('links')
export const contactNumbers = db.collection('contactNumbers')
// CV and cover letter versions; the files themselves are stored in documentFiles
export const documents = db.collection('documents')
export const documentFiles = new GridFSBucket(db, { bucketName: 'documentFiles' })
// Site settings stored as single documents, e.g. { _id: 'profilePhoto', ... }
export const settings = db.collection('settings')
export const imageFiles = new GridFSBucket(db, { bucketName: 'imageFiles' })

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
  await links.createIndex({ createdAt: 1 })
  await contactNumbers.createIndex({ createdAt: 1 })
  await documents.createIndex({ kind: 1, createdAt: -1 })
  console.log('Connected to MongoDB')
}

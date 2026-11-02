import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/portfolio'

export const client = new MongoClient(uri)

// Uses the database named in the connection string ("portfolio" by default)
export const db = client.db()

export const messages = db.collection('messages')

export async function connect() {
  await client.connect()
  await messages.createIndex({ createdAt: -1 })
  console.log('Connected to MongoDB')
}

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'career_leader'

let client: MongoClient | null = null
let connectionPromise: Promise<MongoClient> | null = null

export async function connect() {
  if (!uri) throw new Error('MONGODB_URI env var is required')
  if (!client) {
    client = new MongoClient(uri, {
      connectTimeoutMS: 8_000,
      serverSelectionTimeoutMS: 8_000,
      maxPoolSize: 10,
    })
  }

  if (!connectionPromise) {
    connectionPromise = client.connect().catch(async (error) => {
      const failedClient = client
      client = null
      connectionPromise = null
      void failedClient?.close().catch(() => undefined)
      throw error
    })
  }

  const connectedClient = await connectionPromise
  return connectedClient.db(dbName)
}

export async function getCollection(name: string) {
  const db = await connect()
  return db.collection(name)
}



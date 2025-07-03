// File: src/lib/database.js
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI

class DatabaseService {
  constructor() {
    this.client = null
    this.isConnected = false
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(MONGODB_URI)
      await this.client.connect()
      this.isConnected = true
      console.log('Connected to MongoDB')
    }
    return this.client
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.isConnected = false
      console.log('Disconnected from MongoDB')
    }
  }

  getDatabase(dbName = 'tunemate') {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.client.db(dbName)
  }

  getCollection(collectionName, dbName = 'tunemate') {
    const db = this.getDatabase(dbName)
    return db.collection(collectionName)
  }

  // History-specific methods
  async saveHistoryEntry(historyData) {
    try {
      const collection = this.getCollection('history')
      const result = await collection.insertOne(historyData)
      return {
        success: true,
        insertedId: result.insertedId,
        acknowledged: result.acknowledged
      }
    } catch (error) {
      console.error('Error saving history entry:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getHistoryByAction(action, limit = 10) {
    try {
      const collection = this.getCollection('history')
      const results = await collection
        .find({ action: action })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
      
      return {
        success: true,
        data: results,
        count: results.length
      }
    } catch (error) {
      console.error('Error fetching history by action:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getHistoryByDateRange(startDate, endDate, limit = 50) {
    try {
      const collection = this.getCollection('history')
      const results = await collection
        .find({
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
      
      return {
        success: true,
        data: results,
        count: results.length
      }
    } catch (error) {
      console.error('Error fetching history by date range:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getHistoryStats() {
    try {
      const collection = this.getCollection('history')
      
      const stats = await collection.aggregate([
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            lastUsed: { $max: '$timestamp' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]).toArray()

      const totalEntries = await collection.countDocuments()
      
      return {
        success: true,
        data: {
          totalEntries,
          actionStats: stats
        }
      }
    } catch (error) {
      console.error('Error fetching history stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async searchHistory(searchTerm, limit = 20) {
    try {
      const collection = this.getCollection('history')
      const results = await collection
        .find({
          $or: [
            { inputText: { $regex: searchTerm, $options: 'i' } },
            { referenceText: { $regex: searchTerm, $options: 'i' } },
            { action: { $regex: searchTerm, $options: 'i' } }
          ]
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
      
      return {
        success: true,
        data: results,
        count: results.length
      }
    } catch (error) {
      console.error('Error searching history:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async deleteOldEntries(daysOld = 30) {
    try {
      const collection = this.getCollection('history')
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      
      const result = await collection.deleteMany({
        timestamp: { $lt: cutoffDate }
      })
      
      return {
        success: true,
        deletedCount: result.deletedCount
      }
    } catch (error) {
      console.error('Error deleting old entries:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const db = this.getDatabase()
      const result = await db.admin().ping()
      
      return {
        success: true,
        connected: this.isConnected,
        ping: result
      }
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: error.message
      }
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService()

export default databaseService

// Named exports for specific functions
export {
  databaseService,
  DatabaseService
}
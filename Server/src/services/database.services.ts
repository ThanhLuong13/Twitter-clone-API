import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/Users.schema'
import Follower from '~/models/schemas/Follower.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Tweet } from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import LikeTweet from '~/models/schemas/LikeTweet.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import { envConfig } from '~/constants/config'
const uri = `mongodb+srv://${envConfig.dbUserName}:${envConfig.dbPassword}@twitter.i8qyfo7.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${envConfig.dbName}`)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('error:', error)
      throw error
    }
  }

  async indexUsers() {
    const isExisted = await this.users.indexExists(['email_1', 'email_1_password_1', 'username_1'])
    if (!isExisted) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async refreshTokensIndex() {
    const isExisted = await this.refreshTokens.indexExists(['exp_1', 'token_1'])

    if (!isExisted) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 }) // Xoa token khi het han
    }
  }

  async followersIndex() {
    const isExisted = await this.followers.indexExists(['user_id_1_followed_user_id_1'])

    if (!isExisted) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUserCollection)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokenCollection)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }
  get tweet(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetCollection)
  }
  get hashtag(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagCollection)
  }
  get bookmark(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarkCollection)
  }
  get likeTweet(): Collection<LikeTweet> {
    return this.db.collection(envConfig.dbLikeTweetCollection)
  }
  get conversation(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection)
  }
}

const databaseService = new DatabaseService()
export default databaseService

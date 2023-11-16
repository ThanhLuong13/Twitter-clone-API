import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType, UserVertifyStatus } from '~/constants/enums'
import { TweetReqBody } from '~/models/request/Tweet.request'
import { RegisterReqBody } from '~/models/request/User.request'
import User from '~/models/schemas/Users.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from './cryto'
import Follower from '~/models/schemas/Follower.schema'
import tweetService from '~/services/tweet.services'

const PASSWORD = '123123'
const MYID = new ObjectId('652ac72c5873157e65e26868')
const USER_COUNT = 100

function createRandomUser() {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: faker.internet.password(),
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetReqBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: [],
    mentions: [],
    medias: [],
    parent_id: null
  }
  return tweet
}

const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertUserstoDB = async (users: RegisterReqBody[]) => {
  console.log('Creating user...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseService.users.insertOne(
        new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVertifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`created ${result.length} users`)
  return result
}

const followUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following...')
  const result = await Promise.all(
    followed_user_ids.map(async (followed_user_id) => {
      await databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    })
  )
  console.log(`Followed ${result.length} users`)
}

const insertTweetToDB = async (ids: ObjectId[]) => {
  console.log('Creating tweet ...')
  console.log('Counting ...')
  let count = 0
  const result = await Promise.all(
    ids.map(async (id) => {
      await Promise.all([
        await tweetService.creatTweet(id.toString(), createRandomTweet()),
        await tweetService.creatTweet(id.toString(), createRandomTweet())
      ])
      count += 2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

insertUserstoDB(users).then((ids: ObjectId[]) => {
  followUsers(new ObjectId(MYID), ids)
  insertTweetToDB(ids)
})

import httpStatus from '~/constants/httpStatus'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'
import LikeTweet from '~/models/schemas/LikeTweet.schema'
import { LIKE_TWEET_MESSAGE } from '~/constants/messages'

class LikeTweetService {
  async likeTweet(user_id: string, tweet_id: string) {
    const isExistedTweet = await databaseService.likeTweet.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (isExistedTweet === null) {
      const newBookmark = await databaseService.likeTweet.insertOne(
        new LikeTweet({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      )
      return {
        message: LIKE_TWEET_MESSAGE.LIKE_TWEET_SUCCESS
      }
    }
  }
  async unLikeTweet(user_id: string, tweet_id: string) {
    const isExistedTweet = await databaseService.likeTweet.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (isExistedTweet === null) {
      throw new ErrorWithStatus({
        message: LIKE_TWEET_MESSAGE.UNLIKE_TWEET_SUCCESS,
        status: httpStatus.NOT_FOUND
      })
    }
    await databaseService.likeTweet.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return {
      message: LIKE_TWEET_MESSAGE.UNLIKE_TWEET_SUCCESS
    }
  }
}

const likeTweetService = new LikeTweetService()
export default likeTweetService

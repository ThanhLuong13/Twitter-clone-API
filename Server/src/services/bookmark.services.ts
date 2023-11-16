import httpStatus from '~/constants/httpStatus'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { BOOKMARK_MESSAGE } from '~/constants/messages'
import { BookmarkReqBody } from '~/models/request/Bookmark.request'
import Bookmark from '~/models/schemas/Bookmark.schema'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'

class BookmarkService {
  async creatBookmark(user_id: string, tweet_id: string) {
    const isExistedBookmark = await databaseService.bookmark.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (isExistedBookmark === null) {
      const newBookmark = await databaseService.bookmark.insertOne(
        new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      )
      return {
        message: BOOKMARK_MESSAGE.BOOKMARK_SUCCESS
      }
    }
    return {
      message: BOOKMARK_MESSAGE.UNBOOKMARK_SUCCESS
    }
  }
  async unBookmark(user_id: string, tweet_id: string) {
    const isExistedBookmark = await databaseService.bookmark.findOne({
      tweet_id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    if (isExistedBookmark === null) {
      throw new ErrorWithStatus({
        message: BOOKMARK_MESSAGE.UNBOOKMARK_SUCCESS,
        status: httpStatus.NOT_FOUND
      })
    }
    await databaseService.bookmark.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return {
      message: BOOKMARK_MESSAGE.UNBOOKMARK_SUCCESS
    }
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService

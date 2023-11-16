import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'
import { ObjectId } from 'mongodb'

export interface BookmarkReqBody {
  tweet_id: string
}

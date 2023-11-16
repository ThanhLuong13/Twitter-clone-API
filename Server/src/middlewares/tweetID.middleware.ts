import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { LIKE_TWEET_MESSAGE, TWEET_MASSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'
import { Tweet } from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: LIKE_TWEET_MESSAGE.TWEET_ID_INVALID,
                status: httpStatus.NOT_FOUND
              })
            }
            const tweet = (
              await databaseService.tweet
                .aggregate<Tweet>([
                  {
                    $match: {
                      _id: new ObjectId(value)
                    }
                  },
                  {
                    $lookup: {
                      from: 'hashtag',
                      localField: 'hashtags',
                      foreignField: '_id',
                      as: 'hashtags'
                    }
                  },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'mentions',
                      foreignField: '_id',
                      as: 'mentions'
                    }
                  },
                  {
                    $addFields: {
                      mentions: {
                        $map: {
                          input: '$mentions',
                          as: 'mention',
                          in: {
                            _id: '$$mention._id',
                            name: '$$mention.name',
                            username: '$$mention.username',
                            email: '$$mention.email'
                          }
                        }
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'bookmark',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'bookmarks'
                    }
                  },
                  {
                    $lookup: {
                      from: 'like_tweet',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'likes'
                    }
                  },
                  {
                    $lookup: {
                      from: 'tweet',
                      localField: '_id',
                      foreignField: 'parent_id',
                      as: 'children_tweet'
                    }
                  },
                  {
                    $addFields: {
                      bookmarks: {
                        $size: '$bookmarks'
                      },
                      likes: {
                        $size: '$likes'
                      },
                      retweet_count: {
                        $size: {
                          $filter: {
                            input: '$children_tweet',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', TweetType.Retweet]
                            }
                          }
                        }
                      },
                      comment_count: {
                        $size: {
                          $filter: {
                            input: '$children_tweet',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', TweetType.Comment]
                            }
                          }
                        }
                      },
                      quote_count: {
                        $size: {
                          $filter: {
                            input: '$children_tweet',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', TweetType.QuoteTweet]
                            }
                          }
                        }
                      },
                      views: {
                        $add: ['$user_views', '$guest_views']
                      }
                    }
                  },
                  {
                    $project: {
                      children_tweet: 0
                    }
                  }
                ])
                .toArray()
            )[0]
            if (tweet === null) {
              throw new ErrorWithStatus({
                message: LIKE_TWEET_MESSAGE.TWEET_ID_NOT_FOUND,
                status: httpStatus.NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

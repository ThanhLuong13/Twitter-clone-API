import { TweetReqBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import { Tweet } from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'
import { TWEET_MASSAGE } from '~/constants/messages'
import httpStatus from '~/constants/httpStatus'
import { TweetType } from '~/constants/enums'

class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagsDocuments = await Promise.all(
      hashtags.map((hashtag: string) => {
        return databaseService.hashtag.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagsDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async creatTweet(user_id: string, body: TweetReqBody) {
    const hashtags = await tweetService.checkAndCreateHashtag(body.hashtags)
    const newTweet = await databaseService.tweet.insertOne(
      new Tweet({
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        user_id: new ObjectId(user_id)
      })
    )
    const result = await databaseService.tweet.findOne({ _id: newTweet.insertedId })
    return result
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweet.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )
    return result
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweet
      .aggregate([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
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
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const ids = tweets.map((tweet) => tweet._id)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      await databaseService.tweet.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      await databaseService.tweet.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    return {
      tweets,
      total
    }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const followed_user_ids = await databaseService.followers
      .find(
        {
          user_id: new ObjectId(user_id)
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followed_user_ids.map((item) => item.followed_user_id)
    ids.unshift(new ObjectId(user_id))
    const date = new Date()
    const [followed_user_tweets, total] = await Promise.all([
      databaseService.tweet
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'users'
            }
          },
          {
            $unwind: {
              path: '$users'
            }
          },
          {
            $match: {
              audience: 0
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
              children_tweet: 0,
              users: {
                password: 0,
                forgot_password_token: 0,
                email_verify_token: 0,
                date_of_birth: 0
              }
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      await databaseService.tweet
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'users'
            }
          },
          {
            $unwind: {
              path: '$users'
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    const tweet_id = followed_user_tweets.map((tweet) => tweet._id as ObjectId)
    await databaseService.tweet.updateMany(
      {
        user_id: {
          $in: tweet_id
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )
    followed_user_tweets.forEach((followed_user_tweets) => {
      followed_user_tweets.updated_at = date
      followed_user_tweets.user_views += 1
    })
    return {
      followed_user_tweets,
      total: total[0].total
    }
  }
}

const tweetService = new TweetService()
export default tweetService

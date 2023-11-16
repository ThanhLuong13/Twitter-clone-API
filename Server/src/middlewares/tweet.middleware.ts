import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { TWEET_MASSAGE } from '~/constants/messages'
import { enumNumberToArray } from '~/utils/other'
import { validate } from '~/utils/validation'

const tweetypes = enumNumberToArray(TweetType)
const tweetAudience = enumNumberToArray(TweetAudience)
const mediaType = enumNumberToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetypes],
        errorMessage: TWEET_MASSAGE.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudience],
        errorMessage: TWEET_MASSAGE.INVALID_AUDIENCE
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          // Nếu 'type' là 'comment','quoteTweet', 'tweet' và không có mentions và hashtags thì content là string không được rỗng
          if (
            [TweetType.Comment, TweetType.Tweet, TweetType.QuoteTweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value == ''
          ) {
            throw new Error(TWEET_MASSAGE.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          // Nếu type là 'Retweet' thì 'content' phải là null
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEET_MASSAGE.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // Nếu 'type' là 'retweet, comment, qouteTweets' thì 'parent_id' phải là 'tweet_id' của 'tweet cha'.
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEET_MASSAGE.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          // Nếu type là 'tweet' thì 'parent_id' phải là null (Vì nó là tweet cha)
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEET_MASSAGE.PARENT_ID_MUST_NULL)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(TWEET_MASSAGE.HASHTAGS_MUST_BE_AN_ARRAY_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEET_MASSAGE.MENTIONS_MUST_BE_AN_ARRAY_OF_OBJECTID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (
            !value.every((item: any) => {
              return item.url === 'string' || mediaType.includes(item.type)
            })
          ) {
            throw new Error(TWEET_MASSAGE.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetypes],
          errorMessage: TWEET_MASSAGE.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema({
    limit: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value)
          if (num > 100 || num < 1) {
            throw new Error('1 <= limit <= 100')
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const num = Number(value)
          if (num < 1) {
            throw new Error('page >= 1')
          }
          return true
        }
      }
    }
  })
)

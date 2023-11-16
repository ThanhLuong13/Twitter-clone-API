import { wrapRequestHandler } from '~/utils/handler'
import express from 'express'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import {
  creatTweetController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetDetailController
} from '~/controllers/tweet.controller'
import { createTweetValidator, getTweetChildrenValidator, paginationValidator } from '~/middlewares/tweet.middleware'
import { tweetIdValidator } from '~/middlewares/tweetID.middleware'

const tweetsRouter = express.Router()

/*
 * Description: creat tweet
 * Path: /
 * Method: POST
 * Body: TweetResquestBody
 */
tweetsRouter.post(
  '/create-tweet',
  accessTokenValidator,
  verifiedUserValidator,
  // createTweetValidator,
  wrapRequestHandler(creatTweetController)
)

/*
 * Description: Get tweet details
 * Path: /:tweet_id
 * Method: GET
 * Body: TweetResquestBody
 */
tweetsRouter.get(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(getTweetDetailController)
)

/*
 * Description: Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Body: TweetResquestBody
 */
tweetsRouter.get(
  '/:tweet_id/children',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/*
 * Description: Get new feeds
 * Path: /
 * Method: GET
 * Body: TweetResquestBody
 */
tweetsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(getNewFeedController)
)

export default tweetsRouter

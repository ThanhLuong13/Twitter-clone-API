import { wrapRequestHandler } from '~/utils/handler'
import express from 'express'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import { likeTweetController, unLikeTweetController } from '~/controllers/likeTweet.controller'
import { tweetIdValidator } from '~/middlewares/tweetID.middleware'

const likeTweetRouter = express.Router()

/*
 * Description: Like tweets
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {tweet_id: string}
 */
likeTweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/*
 * Description: Unlike tweets
 * Path: /:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
likeTweetRouter.delete(
  '/tweet/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeTweetController)
)

export default likeTweetRouter

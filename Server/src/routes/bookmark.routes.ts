import { wrapRequestHandler } from '~/utils/handler'
import express from 'express'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import { bookmarkController, unBookmarkController } from '~/controllers/bookmark.controller'
import { tweetIdValidator } from '~/middlewares/tweetID.middleware'

const bookmarkRouter = express.Router()

/*
 * Description: Bookmark tweets
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {tweet_id: string}
 */
bookmarkRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController)
)

/*
 * Description: unBookmark tweets
 * Path: /:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarkRouter.delete(
  '/tweet/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkController)
)

export default bookmarkRouter

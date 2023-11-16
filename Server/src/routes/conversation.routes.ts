import { wrapRequestHandler } from '~/utils/handler'
import express from 'express'
import { accessTokenValidator, getConversationValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import { getConversationController } from '~/controllers/conversation.controller'
import { paginationValidator } from '~/middlewares/tweet.middleware'

const conversationRouter = express.Router()

/*
 * Description: Like tweets
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {tweet_id: string}
 */
conversationRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  // verifiedUserValidator,
  paginationValidator,
  getConversationValidator,
  wrapRequestHandler(getConversationController)
)

export default conversationRouter

import { NextFunction, Request, Response } from 'express'
import { GetConversationParam } from '~/models/request/Conversation.request'
import { TokenPayload } from '~/models/request/User.request'
import conversationService from '~/services/conversation.services'

export const getConversationController = async (
  req: Request<GetConversationParam>,
  res: Response,
  next: NextFunction
) => {
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sender_id = req.decode_authorization?.user_id as string
  const result = await conversationService.getConversation({ sender_id, receiver_id, limit, page })
  return res.json({
    limit,
    page,
    total: Math.ceil(result.total / limit),
    conversation: result.conversation
  })
}

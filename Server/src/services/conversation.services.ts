import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationService {
  async getConversation({
    sender_id,
    receiver_id,
    page,
    limit
  }: {
    sender_id: string
    receiver_id: string
    page: number
    limit: number
  }) {
    const conversation = await databaseService.conversation
      .find({
        $or: [
          {
            sender_id: new ObjectId(sender_id),
            receiver_id: new ObjectId(receiver_id)
          },
          {
            sender_id: new ObjectId(receiver_id),
            receiver_id: new ObjectId(sender_id)
          }
        ]
      })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.conversation.countDocuments({
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    })
    return {
      conversation,
      total
    }
  }
}

const conversationService = new ConversationService()
export default conversationService

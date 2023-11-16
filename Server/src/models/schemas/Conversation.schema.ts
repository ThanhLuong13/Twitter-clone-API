import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  content: string
  receiver_id: ObjectId
  created_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  content: string
  receiver_id: ObjectId
  created_at?: Date
  constructor({ _id, sender_id, content, receiver_id, created_at }: ConversationType) {
    this._id = _id
    this.sender_id = sender_id
    this.content = content
    this.receiver_id = receiver_id
    this.created_at = created_at || new Date()
  }
}

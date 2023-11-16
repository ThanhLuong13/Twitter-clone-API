import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '~/utils/other'
import { TokenPayload } from '~/models/request/User.request'
import { UserVertifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'
import { USERS_MESSAGE } from '~/constants/messages'
import httpStatus from '~/constants/httpStatus'
import { Server as ServerHttp } from 'http'
import { Server } from 'socket.io'
import databaseService from '~/services/database.services'
import Conversation from '~/models/schemas/Conversation.schema'

const initSocket = (httpServer: ServerHttp) => {
  // Socket IO
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1] as string
    try {
      const decode_authorization = await verifyAccessToken(access_token)
      console.log(decode_authorization)
      const { verify } = decode_authorization as TokenPayload
      if (verify !== UserVertifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.USER_NOT_VERIFY,
          status: httpStatus.FORBIDDEN
        })
      }
      socket.handshake.auth.decode_authorization = decode_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    // console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decode_authorization as TokenPayload
    users[user_id] = { socket_id: socket.id }

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (err) {
        next(new Error('Unauthoried'))
      }
    })

    socket.on('error', (err) => {
      if (err.message === 'Unauthoried') {
        socket.disconnect()
      }
    })
    // console.log(users)
    socket.on('send_massage', async (data) => {
      const { receiver_id, sender_id, content } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        content: content,
        receiver_id: new ObjectId(receiver_id)
      })
      const insertConversation = await databaseService.conversation.insertOne(conversation)
      conversation._id = insertConversation.insertedId
      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation
        })
      }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      // console.log(`user ${socket.id} disconnected`)
    })
  })
}

export default initSocket

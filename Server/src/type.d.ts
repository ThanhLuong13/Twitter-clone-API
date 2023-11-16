import { Request } from 'express'
import User from './models/schemas/Users.schema'
import { GetUserProfileParams, TokenPayload } from './models/request/User.request'
import { TweetReqBody } from './models/request/Tweet.request'
import { Tweet } from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refreshToken?: TokenPayload
    decode_email_verify_Token?: TokenPayload
    decode_forgot_password_token?: TokenPayload
    tweet?: Tweet
  }
}

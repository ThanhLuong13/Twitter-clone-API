import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/User.request'
import { LikeTweetReqBody } from '~/models/request/LikeTweet.request'
import likeTweetService from '~/services/likeTweet.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likeTweetService.likeTweet(user_id, tweet_id)
  return res.json({
    result
  })
}

export const unLikeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await likeTweetService.unLikeTweet(user_id, tweet_id)
  return res.json({
    result
  })
}

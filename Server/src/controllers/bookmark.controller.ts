import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/User.request'
import { BookmarkReqBody } from '~/models/request/Bookmark.request'
import bookmarkService from '~/services/bookmark.services'

export const bookmarkController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarkService.creatBookmark(user_id, tweet_id)
  return res.json({
    result
  })
}

export const unBookmarkController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await bookmarkService.unBookmark(user_id, tweet_id)
  return res.json({
    result
  })
}

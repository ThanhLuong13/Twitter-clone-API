import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TweetParam, TweetQuery, TweetReqBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import tweetService from '~/services/tweet.services'

export const creatTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await tweetService.creatTweet(user_id, req.body)
  return res.json({
    message: 'Tweet created',
    result
  })
}

export const getTweetDetailController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
  const { tweet_id } = req.params
  const increaseView = await tweetService.increaseView(tweet_id, req.decode_authorization?.user_id)
  const result = {
    ...req.tweet,
    user_views: increaseView?.user_views,
    guest_views: increaseView?.guest_views,
    views: (increaseView?.user_views as number) + (increaseView?.guest_views as number)
  }
  return res.json({
    message: 'Get tweet successfully',
    result
  })
}

export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_id = req.params.tweet_id
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decode_authorization?.user_id
  const { tweets, total } = await tweetService.getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  return res.json({
    message: 'Get tweet children successfully',
    result: {
      tweets: tweets,
      tweet_type,
      limit,
      page,
      total_tweets: total,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewFeedController = async (req: Request, res: Response) => {
  const user_id = req.decode_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await tweetService.getNewFeeds({
    user_id,
    limit,
    page
  })
  return res.json({
    message: 'Get new feeds successfully',
    result: {
      tweets: result.followed_user_tweets,
      limit,
      page,
      total_tweets: result.total,
      total_page: Math.ceil(result.total / limit)
    }
  })
}

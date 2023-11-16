import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/Users.services'
import {
  FollowReqBody,
  GetUserProfileParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UnFollowReqParams,
  UpdateMeReqBody,
  changePasswordReqBody,
  forgotPasswordReqBody,
  resetPasswordReqBody,
  verifyEmailReqBody,
  verifyforgotPasswordReqBody
} from '~/models/request/User.request'
import User from '~/models/schemas/Users.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGE } from '~/constants/messages'
import { TokenType, UserVertifyStatus } from '~/constants/enums'
import databaseService from '~/services/database.services'
import httpStatus from '~/constants/httpStatus'
import { pick } from 'lodash'
import 'dotenv/config'
import { envConfig } from '~/constants/config'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    result
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauth(code as string)
  const urlRedirect = `${envConfig.ClientRedirectCallback}?access_token=${result.access_token}
&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await usersService.register(req.body)
    return res.json({
      message: 'Register success',
      result
    })
  } catch (error) {
    next(error)
  }
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json({
    message: USERS_MESSAGE.LOGOUT_SUCCESS,
    result
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decode_refreshToken as TokenPayload
  const result = await usersService.refreshToken({ user_id, verify, refresh_token, exp })
  return res.json({
    message: USERS_MESSAGE.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, verifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_email_verify_Token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // Không tìm thấy User
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  }
  // Nếu Email đã Verify rồi thì không báo lỗi
  // Trả về Status OK
  if (user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({ message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESS, result })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  }
  if (user.verify === UserVertifyStatus.Verified) {
    return res.status(httpStatus.OK).json({ message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({ user_id: _id.toString(), verify })
  return res.json(result)
}

export const verifyforgotPasswordController = async (
  req: Request<ParamsDictionary, any, verifyforgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USERS_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGE.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  const user = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGE.UPDATE_ME_SUCCESS,
    result: user
  })
}

export const getUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGE.GET_USER_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unfollowController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unfollow(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, changePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.json(result)
}

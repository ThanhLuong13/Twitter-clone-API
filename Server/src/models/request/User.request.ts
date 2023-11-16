import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVertifyStatus } from '~/constants/enums'

export interface LoginReqBody {
  email: string
  password: string
}

export interface verifyEmailReqBody {
  email_verify_token: string
}

export interface forgotPasswordReqBody {
  email: string
}

export interface verifyforgotPasswordReqBody {
  forgot_password_token: string
}

export interface changePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface resetPasswordReqBody {
  password: string
  confirm_password: string
  user_id: string
}

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVertifyStatus
  exp: number
  iat: number
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetUserProfileParams extends ParamsDictionary {
  username: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}

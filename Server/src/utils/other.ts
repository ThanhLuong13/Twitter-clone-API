import httpStatus from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'
import { verifyToken } from './jwt'
import { Request } from 'express'
import { capitalize } from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
import { envConfig } from '~/constants/config'

export const enumNumberToArray = (enumNumber: { [key: string]: string | number }) => {
  return Object.values(enumNumber).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
      status: httpStatus.UNAUTHORIZED
    })
  }
  try {
    const decode_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: envConfig.accessTokenJWTSecret
    })
    if (req) {
      ;(req as Request).decode_authorization = decode_authorization
      return true
    }
    return decode_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: httpStatus.UNAUTHORIZED
    })
  }
}

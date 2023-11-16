import exp from 'constants'
import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { REGEX_USERNAME } from '~/constants/Regex'
import { envConfig } from '~/constants/config'
import { UserVertifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'
import { TokenPayload } from '~/models/request/User.request'
import { ErrorWithStatus } from '~/models/schemas/Errors.schema'
import usersService from '~/services/Users.services'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/cryto'
import { verifyToken } from '~/utils/jwt'
import { verifyAccessToken } from '~/utils/other'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_A_STRING
  },
  notEmpty: {
    errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGE.PASSWORD_LENGTH
  }
}

const confirmPasswordSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  notEmpty: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 20
    },
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGTH
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_THE_SAME)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decode_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: envConfig.verifyForgotPasswordTokenJWTSecret
        })
        const { user_id } = decode_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.USER_NOT_FOUND,
            status: httpStatus.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
            status: httpStatus.UNAUTHORIZED
          })
        }
        ;(req as Request).decode_forgot_password_token = decode_forgot_password_token
      } catch (error) {
        throw new ErrorWithStatus({
          message: capitalize((error as JsonWebTokenError).message),
          status: httpStatus.UNAUTHORIZED
        })
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGE.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGE.NAME_LENGTH
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.USER_ID_INVALID,
          status: httpStatus.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (followed_user === null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.USER_NOT_FOUND,
          status: httpStatus.NOT_FOUND
        })
      }
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              // throw new ErrorWithStatus({ message: 'Email already exists', status: 401 })
              throw new Error(USERS_MESSAGE.EMAIL_OR_PASSWORD_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        isString: {
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_A_STRING
        },
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGTH
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExists(value)
            if (isExistEmail) {
              // throw new ErrorWithStatus({ message: 'Email already exists', status: 401 })
              throw new Error(USERS_MESSAGE.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            return verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        isString: {
          errorMessage: USERS_MESSAGE.REFRESH_TOKEN_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decode_refreshToken, refresh_token] = await Promise.all([
                await verifyToken({ token: value, secretOrPublicKey: envConfig.refreshTokenJWTSecret }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGE.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              ;(req as Request).decode_refreshToken = decode_refreshToken
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        isString: {
          errorMessage: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decode_email_verify_Token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.verifyEmailTokenJWTSecret
              })
              ;(req as Request).decode_email_verify_Token = decode_email_verify_Token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: httpStatus.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (user === null) {
              throw new Error(USERS_MESSAGE.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema({
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode_authorization as TokenPayload
  if (verify !== UserVertifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_VERIFY,
        status: httpStatus.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.BIO_MUST_BE_A_STRING
        },
        trim: true
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.LOCATION_MUST_BE_A_STRING
        },
        trim: true
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.WEBSITE_MUST_BE_A_STRING
        },
        trim: true
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error(USERS_MESSAGE.USERNAME_INVALID)
            }
            const user = await databaseService.users.findOne({ username: value })
            // Da ton tai Username nay trong DB
            if (user) {
              throw new Error(USERS_MESSAGE.USERNAME_EXISTED)
            }
          }
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.AVATAR_MUST_BE_A_STRING
        },
        trim: true
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.COVER_PHOTO_MUST_BE_A_STRING
        },
        trim: true
      }
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema({
    followed_user_id: userIdSchema
  })
)

export const unfollowValidator = validate(
  checkSchema({
    user_id: userIdSchema
  })
)

export const getConversationValidator = validate(
  checkSchema(
    {
      receiver_id: userIdSchema
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decode_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (user === null) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.USER_NOT_FOUND,
              status: httpStatus.NOT_FOUND
            })
          }
          const { password } = user
          const isMatchPassword = hashPassword(value) === password
          if (!isMatchPassword) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.OLD_PASSWORD_INCORRECT,
              status: httpStatus.UNAUTHORIZED
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)

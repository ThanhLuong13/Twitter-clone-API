import express from 'express'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/user.middlewares'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getUserProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyforgotPasswordController
} from '~/controllers/users.controller'
import { wrapRequestHandler } from '~/utils/handler'
import { filterMiddleware } from '~/middlewares/common.middleware'
import { UpdateMeReqBody } from '~/models/request/User.request'
const usersRouter = express.Router()

/*
 * Description: Register
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirmPassword: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/*
 * Description: login
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/*
 * Description: login
 * Path: //oauth/google
 * Method: GET
 * Query : {code: string}
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

/*
 * Description: refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: {refresh_token: string}
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/*
 * Description: logout user
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {refresh_token: string}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/*
 * Description: Verify email when register
 * Path: /verify-email
 * Method: POST
 * Body: {email-verify-token: string}
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/*
 * Description: Resend verify email
 * Path: /verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/*
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/*
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot-password-token: string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyforgotPasswordController)
)

/*
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot-password-token: string,
 *         password: string,
 *         confirm password:string }
 */

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/*
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/*
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'avatar',
    'location',
    'website',
    'username',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/*
 * Description: Get user profile
 * Path: /:username
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/:username', wrapRequestHandler(getUserProfileController))

/*
 * Description: Follow user
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {followed_user_id : string}
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/*
 * Description: Unfollow user
 * Path: /follow/user_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

/*
 * Description: Change password
 * Path: /change-password
 * Method: PUT
 * Header: { Authorization: Bearer <access_token> }
 * body: { old-password: string, password: string, confirm-password: string }
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter

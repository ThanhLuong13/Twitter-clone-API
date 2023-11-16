import express from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/media.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/user.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const mediaRouter = express.Router()

/*
 * Description: Upload images
 * Path: //upload-image
 * Method: POST
 * Body: File data { image: file }
 */
mediaRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

/*
 * Description: Upload videos
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
mediaRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

export default mediaRouter

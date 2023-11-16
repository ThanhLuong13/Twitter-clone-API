import express from 'express'
import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/media.controller'
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

//

mediaRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

mediaRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
)

export default mediaRouter

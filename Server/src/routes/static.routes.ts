import express from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/media.controller'

const staticRouter = express.Router()

staticRouter.get('/images/:name', serveImageController)
staticRouter.get('/video-stream/:name', serveVideoStreamController)

export default staticRouter

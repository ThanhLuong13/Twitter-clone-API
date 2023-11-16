import express from 'express'
import {
  serveImageController,
  serveM3u8Controller,
  serveSegmentController,
  serveVideoStreamController
} from '~/controllers/media.controller'

const staticRouter = express.Router()

staticRouter.get('/images/:name', serveImageController)
staticRouter.get('/video-stream/:name', serveVideoStreamController)
staticRouter.get('/video-hls/:id/master.m3u8', serveM3u8Controller)
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)

export default staticRouter

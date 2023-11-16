/* eslint-disable prettier/prettier */
import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRouter from './routes/medias.routes'
import { initFoldersUploads } from './utils/file'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweet.routes'
import bookmarkRouter from './routes/bookmark.routes'
import likeTweetRouter from './routes/likeTweet.routes'
// import '~/utils/fake'
import { createServer } from 'http'
import conversationRouter from './routes/conversation.routes'
import initSocket from './utils/socket.io'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import helmet from 'helmet'

const file = fs.readFileSync(path.resolve('Twitter-swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.refreshTokensIndex()
  databaseService.followersIndex()
})
const app = express()
const httpServer = createServer(app)
app.use(helmet())
const port = 4000
// Create upload folder
initFoldersUploads()

app.use(cors())

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/users', usersRouter)
app.use('/media', mediaRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmark', bookmarkRouter)
app.use('/conversation', conversationRouter)
app.use('/like-tweet', likeTweetRouter)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

initSocket(httpServer)
//
httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

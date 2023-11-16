import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { getNameFormFullName, handleUploadImage, handleUploadVideo, handleUploadVideoHLS } from '~/utils/file'
import fs from 'fs' // filesystem
import { isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import fsPromise from 'fs/promises'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { envConfig } from '~/constants/config'
class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    ;(this.items = []), (this.encoding = false)
  }
  async enqueue(item: string) {
    this.items.push(item)
    const newName = item.split('\\').pop()
    const idName = getNameFormFullName(newName as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFormFullName(videoPath.split('\\').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Fail
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((error) => console.log(error))
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log(`encode video queue is empty`)
    }
  }
}

const queue = new Queue()

// Xử lý ảnh với Sharp
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath) // convert image to jpeg va chuyen image den folder uploads
        fs.unlinkSync(file.filepath) // Xoa anh trong file temp
        return {
          url: isProduction
            ? `${envConfig.host}/static/images/${newName}.jpg`
            : `http://localhost:${envConfig.port}/static/images/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${envConfig.host}/static/video/${file.newFilename}`
          : `http://localhost:${envConfig.port}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename) // Name kh  co extName vi da xoa file.mp4
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${envConfig.host}/static/video-hls/${newName}.m3u8/`
            : `http://localhost:${envConfig.port}/static/video-hls/${newName}.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const videoStatus = await databaseService.videoStatus.findOne({ name: id })
    console.log(videoStatus)
    return videoStatus
  }
}

const mediaService = new MediaService()
export default mediaService

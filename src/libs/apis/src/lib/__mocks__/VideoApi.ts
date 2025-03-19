import { jest } from '@jest/globals'

class VideoApi {
  static loadVideo = jest.fn()

  static updateVideo = jest.fn()
}

export default VideoApi

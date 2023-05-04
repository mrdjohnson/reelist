import Video from '@reelist/models/Video'
import { createTmdbVideo } from '@reelist/models/factories/TmdbVideoFactory'
import { createVideoTable } from '@reelist/models/factories/VideoTableFactory'
import { createUser } from '@reelist/models/factories/UserFactory'
import Auth from '@reelist/models/Auth'
import VideoStore from '@reelist/models/VideoStore'
import VideoApiSource from '@reelist/apis/VideoApi'
import { VideoTableType } from '@reelist/interfaces/tables/VideoTable'

jest.mock('~/api/VideoApi')

const VideoApi = jest.mocked(VideoApiSource)

describe('Video', () => {
  let auth: Auth
  let videoStore: VideoStore

  const createVideo = ({
    tmdbVideo = null,
    videoId = null,
    videoTableData = null,
  }: {
    tmdbVideo?: Partial<Video> | null
    videoId?: string | null
    videoTableData?: VideoTableType | null
  } = {}) => {
    return new Video(tmdbVideo || createTmdbVideo(), auth, videoStore, videoTableData, videoId)
  }

  beforeEach(() => {
    auth = new Auth()
    videoStore = new VideoStore(auth)

    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('creates a video object based on tmdb video', () => {
      const tmdbVideo = createTmdbVideo({ mediaType: 'movie', title: '007' })
      const video = createVideo({ tmdbVideo })

      expect(video.title).toEqual('007')
    })

    it('uses the videoId and the userId to lazy load videos', () => {
      const videoId = 'video_test_video_id'
      const userId = 'video_test_user_id'

      const user = createUser({ id: userId })
      auth.user = user

      expect(VideoApi.loadVideo).toHaveBeenCalledTimes(0)

      createVideo({ videoId })

      expect(VideoApi.loadVideo).toHaveBeenCalledTimes(1)
      expect(VideoApi.loadVideo).toHaveBeenCalledWith({ userId, videoId })
    })

    it('sets the serverId from the server on lazy load', async () => {
      const videoTableData = createVideoTable.create({ id: 'some_resolved_server_id' })

      VideoApi.loadVideo.mockResolvedValue({ data: videoTableData, error: null })

      const video = createVideo()

      await flushPromises()

      expect(video.serverId).toEqual('some_resolved_server_id')
    })

    it('sets the serverId from the preloaded table data', async () => {
      const videoTableData = createVideoTable.create({ id: 'some_preloaded_server_id' })

      const video = createVideo({ videoTableData })

      await flushPromises()

      expect(VideoApi.loadVideo).not.toHaveBeenCalled()

      expect(video.serverId).toEqual('some_preloaded_server_id')
    })
  })
})

export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 1))

import { Factory } from 'fishery'

import User from '@reelist/models/User'
import inversionContainer from '@reelist/models/inversionContainer'
import UserShow from '@reelist/models/UserShow'
import { userFactory } from '@reelist/models/__factories__/UserFactory'
import VideoStore from '@reelist/models/VideoStore'
import { TmdbShowById } from '@reelist/models/tmdb/TmdbShowById'
import { tmdbShowFactory } from '@reelist/interfaces/tmdb/__factories__/TmdbVideoResponseFactory'

export const userShowFactory = Factory.define<
  number,
  { user?: User; show?: TmdbShowById },
  UserShow
>(({ onCreate, transientParams }) => {
  onCreate(async () => {
    const user = transientParams.user || (await userFactory.create())
    const show = transientParams.show || (await tmdbShowFactory.create())

    const videoStore = inversionContainer.get<VideoStore>(VideoStore)

    const userShow = await videoStore.getUserVideo(show.videoId, user)

    if (!userShow || !userShow.isTv || !userShow.hasUser) {
      throw new Error('UserShow unable to make or find user show')
    }

    return userShow
  })

  return -1
})

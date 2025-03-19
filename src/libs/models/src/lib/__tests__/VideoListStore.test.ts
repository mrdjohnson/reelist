import { videoListFactory } from '@reelist/models/__factories__/VideoListFactory'

import inversionContainer from '@reelist/models/inversionContainer'
import VideoListStore from '@reelist/models/VideoListStore'
import { userFactory } from '@reelist/models/__factories__/UserFactory'

describe('VideoListStore', () => {
  let videoListStore: VideoListStore

  beforeEach(async () => {
    videoListStore = inversionContainer.get<VideoListStore>(VideoListStore)
  })

  afterEach(() => {
    videoListFactory.rewindSequence()
  })

  it('fetches list current user admins', async () => {
    await userFactory.transient({ loggedIn: true }).create()

    const videoListsToJoin = await videoListFactory.createList(3, {
      is_public: true,
      is_joinable: true,
    })

    for (const videoList of videoListsToJoin) {
      await videoList.join()
    }

    const joinedLists = await videoListStore.getAdminVideoLists()
    expect(joinedLists.length).toBe(videoListsToJoin.length)
  })

  it('fetches admin lists for user', async () => {
    const user = await userFactory.transient({ loggedIn: true }).create()

    const videoListsToFollow = await videoListFactory.createList(3, { is_public: true })

    for (const videoListToFollow of videoListsToFollow) {
      await user.toggleFollowingVideoList(videoListToFollow)
    }

    const followedLists = await videoListStore.getfollowedVideoLists()
    const publicLists = await videoListStore.getPublicVideoLists()

    expect(followedLists.length).toBe(videoListsToFollow.length)
    expect(publicLists.length).toBe(0)
  })
})

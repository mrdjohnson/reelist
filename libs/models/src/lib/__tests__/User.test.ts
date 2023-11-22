import User from '@reelist/models/User'

import { expectMockServer, mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import { videoListFactory } from '@reelist/models/__factories__/VideoListFactory'
import { loggedInUserFactory, userFactory } from '@reelist/models/__factories__/UserFactory'

describe('User', () => {
  let user: User

  beforeEach(async () => {
    user = await loggedInUserFactory.create()
  })

  afterEach(() => {
    userFactory.rewindSequence()
    videoListFactory.rewindSequence()
  })

  it('can follow and unfollow other users', async () => {
    mockServer.supabase.patch('/profiles', {})

    const friend = await userFactory.create()

    expect(user.isFollowingUser(friend)).toBe(false)

    await user.toggleFollowingUser(friend)

    expect(user.isFollowingUser(friend)).toBe(true)

    await expectMockServer.toHaveBeenCalledWith({
      followed_user_ids: [friend.id],
    })

    await user.toggleFollowingUser(friend)

    expect(user.isFollowingUser(friend)).toBe(false)
  })

  it('can follow and unfollow a videolist', async () => {
    mockServer.supabase.patch('/profiles', {})

    const videoList = await videoListFactory.create()

    expect(user.isFollowingVideoList(videoList)).toBe(false)

    await user.toggleFollowingVideoList(videoList)

    await expectMockServer.toHaveBeenCalledWith({ followed_list_ids: [videoList.id] })

    expect(user.isFollowingVideoList(videoList)).toBe(true)

    await user.toggleFollowingVideoList(videoList)

    expect(user.isFollowingVideoList(videoList)).toBe(false)
  })

  it('adds and removes multiple users', async () => {
    mockServer.supabase.patch('/profiles', {})

    const [user1, user2, user3] = await userFactory.createList(3)

    await user.toggleFollowingUser(user1)
    await user.toggleFollowingUser(user2)

    expect(user.isFollowingUser(user1)).toBe(true)
    expect(user.isFollowingUser(user2)).toBe(true)
    expect(user.isFollowingUser(user3)).toBe(false)

    await user.toggleFollowingUser(user2)
    await user.toggleFollowingUser(user3)

    expect(user.isFollowingUser(user1)).toBe(true)
    expect(user.isFollowingUser(user2)).toBe(false)
    expect(user.isFollowingUser(user3)).toBe(true)
  })

  it('adds and removes multiple videoLists', async () => {
    mockServer.supabase.patch('/profiles', {})

    const [videoList1, videoList2, videoList3] = await videoListFactory.createList(3)

    await user.toggleFollowingVideoList(videoList1)
    await user.toggleFollowingVideoList(videoList2)

    expect(user.isFollowingVideoList(videoList1)).toBe(true)
    expect(user.isFollowingVideoList(videoList2)).toBe(true)
    expect(user.isFollowingVideoList(videoList3)).toBe(false)

    await user.toggleFollowingVideoList(videoList2)
    await user.toggleFollowingVideoList(videoList3)

    expect(user.isFollowingVideoList(videoList1)).toBe(true)
    expect(user.isFollowingVideoList(videoList2)).toBe(false)
    expect(user.isFollowingVideoList(videoList3)).toBe(true)
  })
})

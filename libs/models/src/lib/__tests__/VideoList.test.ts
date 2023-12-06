import { videoListFactory } from '@reelist/models/__factories__/VideoListFactory'
import VideoList from '@reelist/models/VideoList'

import {
  tmdbMovieFactory,
  tmdbShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbVideoResponseFactory'
import { TmdbVideoPartialType } from '@reelist/interfaces/tmdb/TmdbVideoPartialType'
import _ from 'lodash'
import { AutoSortType } from '@reelist/interfaces/tables/VideoListTable'
import { userFactory } from '@reelist/models/__factories__/UserFactory'

describe('VideoList', () => {
  let videoList: VideoList

  beforeEach(async () => {
    videoList = await videoListFactory.create()
  })

  afterEach(() => {
    videoListFactory.rewindSequence()
  })

  async function addOrRemoveAndCheckFor(video: TmdbVideoPartialType, items: string[]) {
    await videoList.addOrRemoveVideo(video)

    expect(videoList.videoIds).toEqual(items)
  }

  it('allows adding and removing videos', async () => {
    const show = await tmdbShowFactory.create()
    const movie = await tmdbMovieFactory.create()

    if (!show || !movie) {
      throw new Error('Videos not found')
    }

    expect(videoList.videoIds).toEqual([])

    await addOrRemoveAndCheckFor(show, [show.videoId])

    await addOrRemoveAndCheckFor(show, [])

    await addOrRemoveAndCheckFor(movie, [movie.videoId])

    await addOrRemoveAndCheckFor(show, [movie.videoId, show.videoId])
  })

  it('sorts videos correctly', async () => {
    const changeSortAndExpect = async (
      {
        autoSortIsAscending,
        autoSortType,
      }: {
        autoSortIsAscending: boolean
        autoSortType: AutoSortType
      },
      expectedIds: number[],
    ) => {
      // update the sort types
      videoListViewModel.autoSortIsAscending = autoSortIsAscending
      videoListViewModel.autoSortType = autoSortType

      // update the model
      await videoList.save()

      const videoIds = videoList.videos.map(video => video.id)

      console.log(videoIds)
      // expect ids to be correct
      expect(videoIds).toEqual(expectedIds)
    }

    const names = ['bbbb', 'cccc', 'dddd', 'eeee', 'aaaa'] // last is first
    const firstAirDates = ['2023-02-01', '2023-01-01', '2023-03-01', '2023-04-01', '2023-05-01'] // second is first
    const lastAirDates = ['2023-02-01', '2023-03-01', '2023-01-01', '2023-04-01', '2023-05-01'] // third is first

    // create a uniq mix of names, first air and last air dates
    const values = _.zip(names, firstAirDates, lastAirDates)
    const shows = []

    // create shows based on the ordering of the earlier values
    for (const [name, firstAirDate, lastAirDate] of values) {
      const show = await tmdbShowFactory.create({
        name,
        firstAirDate,
        lastAirDate,
      })

      shows.push(show)

      await videoList.addOrRemoveVideo(show)
    }

    expect(videoList.videoIds).toEqual(_.map(shows, 'videoId'))

    const videoListViewModel = videoList.viewModel

    // FIRST_AIRED
    await changeSortAndExpect(
      { autoSortIsAscending: true, autoSortType: AutoSortType.FIRST_AIRED },
      [2, 1, 3, 4, 5],
    )
    await changeSortAndExpect(
      { autoSortIsAscending: false, autoSortType: AutoSortType.FIRST_AIRED },
      [5, 4, 3, 1, 2],
    )

    // LAST_AIRED
    await changeSortAndExpect(
      { autoSortIsAscending: true, autoSortType: AutoSortType.LAST_AIRED },
      [3, 1, 2, 4, 5],
    )
    await changeSortAndExpect(
      { autoSortIsAscending: false, autoSortType: AutoSortType.LAST_AIRED },
      [5, 4, 2, 1, 3],
    )

    // NAME
    await changeSortAndExpect(
      { autoSortIsAscending: true, autoSortType: AutoSortType.NAME },
      [5, 1, 2, 3, 4],
    )
    await changeSortAndExpect(
      { autoSortIsAscending: false, autoSortType: AutoSortType.NAME },
      [4, 3, 2, 1, 5],
    )

    //todo: add total time test here
  })

  it('fetches admins for a list', async () => {
    const user = await userFactory.transient({ loggedIn: true }).create()

    const _nonAdmins = await userFactory.createList(5)

    const admins = await userFactory.createList(5)

    const adminIds = _.map(admins, 'id').concat([user.id])

    videoList = await videoListFactory.create({ admin_ids: adminIds })

    await videoList.fetchAdmins()
    const allAdmins = videoList.admins
    expect(_.map(allAdmins, 'id')).toEqual(adminIds)
  })
})

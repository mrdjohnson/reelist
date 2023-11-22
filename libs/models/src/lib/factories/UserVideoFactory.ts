import { Factory } from 'fishery'

import UserVideo, { UserMovie, UserVideoType } from '@reelist/models/UserVideo'
import User from '@reelist/models/User'
import { userFactory } from '../__factories__/UserFactory'
import {
  tmdbMovieFactory,
  tmdbShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbVideoResponseFactory'
import { VideoTableType } from '@reelist/interfaces/tables/VideoTable'
import UserShow from '@reelist/models/UserShow'
import { faker } from '@faker-js/faker'

export const userShowFactory = Factory.define<
  null,
  {
    user?: User
    tableData?: VideoTableType
  },
  UserShow
>(({ params, onCreate, transientParams }) => {
  onCreate(async () => {
    const baseShow = await tmdbShowFactory.create(params)
    const user = transientParams.user || (await userFactory.create())

    return UserVideo.create(baseShow, user, transientParams.tableData)
  })

  return null
})

export const userMovieFactory = Factory.define<
  null,
  {
    user?: User
    tableData?: VideoTableType
  },
  UserMovie
>(({ params, onCreate, transientParams }) => {
  onCreate(async () => {
    const baseMovie = await tmdbMovieFactory.create(params)
    const user = transientParams.user || (await userFactory.create())

    return UserVideo.create(baseMovie, user, transientParams.tableData)
  })

  return null
})

export const userVideoFactory = Factory.define<
  null,
  {
    user?: User
    isTv?: boolean
    tableData?: VideoTableType
  },
  UserVideoType
>(({ sequence, onCreate, transientParams }) => {
  onCreate(async () => {
    if (transientParams.isTv ?? faker.datatype.boolean()) {
      return await userShowFactory.transient(transientParams).create()
    } else {
      return await userMovieFactory.transient(transientParams).create()
    }
  })

  return null
})

export const userVideoFromShowFactory = userVideoFactory.transient({ isTv: true })
export const userVideoFromMovieFactory = userVideoFactory.transient({ isTv: false })

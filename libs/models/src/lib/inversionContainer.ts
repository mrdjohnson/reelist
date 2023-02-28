import { Container } from 'inversify'

import Auth from '@reelist/models/Auth'
import Store from '@reelist/models/Store'
import AppState from '@reelist/models/AppState'
import VideoStore from '@reelist/models/VideoStore'
import UserStore from '@reelist/models/UserStore'
import VideoListStore from '@reelist/models/VideoListStore'
import VideoApi from '@reelist/apis/VideoApi'

const inversionContainer = new Container()

inversionContainer.bind<Auth>(Auth).toSelf().inSingletonScope()
inversionContainer.bind<Store>(Store).toSelf().inSingletonScope()
inversionContainer.bind<AppState>(AppState).toSelf().inSingletonScope()
inversionContainer.bind<VideoStore>(VideoStore).toSelf().inSingletonScope()
inversionContainer.bind<UserStore>(UserStore).toSelf().inSingletonScope()
inversionContainer.bind<VideoListStore>(VideoListStore).toSelf().inSingletonScope()
inversionContainer.bind<VideoApi>(VideoApi).toSelf().inSingletonScope()

export default inversionContainer

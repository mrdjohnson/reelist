import { Container } from 'inversify'

import Auth from '~/models/Auth'
import Store from '~/models/Store'
import AppState from '~/models/AppState'
import VideoStore from '~/models/VideoStore'
import UserStore from '~/models/UserStore'
import VideoListStore from '~/models/VideoListStore'
import VideoApi from '~/api/VideoApi'

const inversionContainer = new Container()

inversionContainer.bind<Auth>(Auth).toSelf().inSingletonScope()
inversionContainer.bind<Store>(Store).toSelf().inSingletonScope()
inversionContainer.bind<AppState>(AppState).toSelf().inSingletonScope()
inversionContainer.bind<VideoStore>(VideoStore).toSelf().inSingletonScope()
inversionContainer.bind<UserStore>(UserStore).toSelf().inSingletonScope()
inversionContainer.bind<VideoListStore>(VideoListStore).toSelf().inSingletonScope()
inversionContainer.bind<VideoApi>(VideoApi).toSelf().inSingletonScope()

export default inversionContainer

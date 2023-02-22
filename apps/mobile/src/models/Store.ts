import AppState from './AppState'
import Auth from './Auth'
import VideoListStore from './VideoListStore'
import VideoStore from './VideoStore'
import UserStore from './UserStore'

class Store {
  auth = new Auth()
  appState = new AppState()
  videoStore = new VideoStore(this.auth)
  userStore = new UserStore(this.auth)
  videoListStore = new VideoListStore(this.auth, this.videoStore, this.userStore)
}

export default Store

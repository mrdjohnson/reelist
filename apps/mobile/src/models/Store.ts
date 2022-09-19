import AppState from './AppState'
import Auth from './Auth'
import VideoListStore from './VideoListStore'
import VideoStore from './VideoStore'

class Store {
  auth = new Auth()
  appState = new AppState()
  videoStore = new VideoStore(this.auth)
  videoListStore = new VideoListStore(this.auth, this.videoStore)
}

export default Store

import AppState from './AppState'
import Auth from './Auth'
import VideoListStore from './VideoListStore'
import VideoStore from './VideoStore'

class Store {
  auth = new Auth()
  appState = new AppState()
  videoListStore = new VideoListStore(this.auth)
  videoStore = new VideoStore(this.auth)
}

export default Store

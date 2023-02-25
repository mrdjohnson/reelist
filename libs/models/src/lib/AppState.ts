import { makeAutoObservable, observable } from 'mobx'
import _ from 'lodash'
import User from '@reelist/models/User'
import Video from '@reelist/models/Video'
import { injectable } from 'inversify'

type UpdateType = {
  message: string
  onClose: () => void
  id: number
}

type ProfileScreenType = {
  user: User | null
  editing: boolean
}

@injectable()
export default class AppState {
  // todo: set to false by default
  dialogStack: Record<string, { size: number; options: any }> = {}
  updates: UpdateType[] = []
  _updateId = 0
  videoListShareId: string | null = null
  profileScreen: ProfileScreenType = { user: null, editing: false }
  currentVideo?: Video
  actionSheets: {
    video: { isOpen: boolean; video?: Video }
  } = {
    video: { isOpen: false },
  }

  constructor() {
    makeAutoObservable(this)
  }

  openDialog = (name: string, options: any = null) => {
    this.dialogStack[name] = { size: _.size(this.dialogStack) + 1, options }
  }

  closeDialog = (name: string) => {
    delete this.dialogStack[name]
  }

  isDialogOpen = (name: string) => {
    return (this.dialogStack[name]?.size || 0) > 0
  }

  getDialogOptions = <T>(name: string) => {
    return this.dialogStack[name]?.options as T
  }

  createUpdate = (message: string) => {
    const id = this._updateId++

    const nextUpdate = {
      id,
      message,
      onClose: () => {
        _.remove(this.updates, update => update.id === id)
      },
    }

    this.updates.push(nextUpdate)
  }

  closeUpdates = () => {
    this.updates = []
  }

  setVideoListShareId = (videoListShareId: string | null) => {
    this.videoListShareId = videoListShareId
  }

  setProfileScreenUser = (user: User | null) => {
    this.profileScreen.user = user
  }

  setProfileScreenEditing = (editing: boolean) => {
    this.profileScreen.editing = editing
  }

  setCurrentVideo = (video?: Video) => {
    this.currentVideo = video
  }

  clearCurrentVideo = () => {
    this.currentVideo = undefined
  }

  setActionSheetVideo = (video: Video) => {
    this.actionSheets.video = { video, isOpen: true }
  }

  clearActionSheetVideo = () => {
    this.actionSheets.video = { ...this.actionSheets.video, isOpen: false }
  }
}

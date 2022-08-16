import { makeAutoObservable, observable } from 'mobx'
import _ from 'lodash'

type UpdateType = {
  message: string
  onClose: () => void
  id: number
}
export default class AppState {
  // todo: set to false by default
  dialogStack: Record<string, { size: number; options: any }> = {}
  updates: UpdateType[] = []
  _updateId = 0
  videoListShareId: string | null = null

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

  setVideoListShareId = (videoListShareId: string) => {
    this.videoListShareId = videoListShareId
  }
}

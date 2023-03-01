type WatchedSeasonJson = {
  watched?: boolean
  episodes?: Record<number, boolean>
}

export type VideoInfoType = {
  watched?: boolean
  seasons?: Record<number, WatchedSeasonJson>
}

export type VideoTableType = {
  id: string
  video_id: string
  tracked: boolean
  last_watched_season_number: number | null
  last_watched_episode_number: number | null
  video_info: VideoInfoType
  user_id: string
  allow_in_history: boolean
  updated_at: Date
}

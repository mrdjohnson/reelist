export enum AutoSortType {
  NONE,
  NAME,
  FIRST_AIRED,
  LAST_AIRED,
  TOTAL_TIME,
}

export type VideoListTableType = {
  id: string
  admin_ids: string[]
  is_joinable: boolean
  name: string
  video_ids: string[]
  is_public: boolean
  unique_id: string
  auto_sort_type: AutoSortType
  auto_sort_is_ascending: boolean
}

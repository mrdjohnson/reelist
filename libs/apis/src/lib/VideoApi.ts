import TableApi from '@reelist/apis/TableApi'

import { VideoTableType } from '@reelist/utils/interfaces/tables/VideoTable'

class VideoApi extends TableApi<VideoTableType> {
  loadVideo = async ({ videoId }: { videoId: string }) => {
    const userId = this.supabase.auth.user()?.id

    const { data, error } = await this.match({ user_id: userId, video_id: videoId }).maybeSingle()

    return { data, error }
  }

  updateVideo = async (nextData: Partial<VideoTableType>) => {
    const userId = this.supabase.auth.user()?.id

    const { data, error } = await this.fromTable.upsert({ ...nextData, user_id: userId }).single()

    return { data, error }
  }
}

export default VideoApi

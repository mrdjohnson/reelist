import { SupabaseClient } from '@supabase/supabase-js'
import { inject, injectable } from 'inversify'

import { VideoTableType } from '@reelist/utils/interfaces/tables/VideoTable'

@injectable()
class VideoApi {
  constructor(@inject(SupabaseClient) private supabase: SupabaseClient) {}

  loadVideo = async ({ videoId }: { videoId: string }) => {
    const userId = this.supabase.auth.user()?.id

    const { data, error } = await this.supabase
      .from<VideoTableType>('videos')
      .select('*')
      .match({ user_id: userId, video_id: videoId })
      .maybeSingle()

    return { data, error }
  }

  updateVideo = async (nextData: Partial<VideoTableType>) => {
    const userId = this.supabase.auth.user()?.id

    const { data, error } = await this.supabase
      .from<VideoTableType>('videos')
      .upsert({ ...nextData, user_id: userId })
      .single()

    return { data, error }
  }
}

export default VideoApi

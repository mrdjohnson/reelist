import { SupabaseClient } from '@supabase/supabase-js'
import { inject, injectable } from 'inversify'
import Auth from '~/models/Auth'

import { VideoTableType } from '~/models/Video'

@injectable()
class VideoApi {
  constructor(
    @inject(SupabaseClient) private supabase: SupabaseClient,
    @inject(Auth) private storeAuth: Auth,
  ) {}

  loadVideo = async ({ videoId }: { videoId: string }) => {
    const { data, error } = await this.supabase
      .from<VideoTableType>('videos')
      .select('*')
      .match({ user_id: this.storeAuth.user.id, video_id: videoId })
      .maybeSingle()

    return { data, error }
  }

  updateVideo = async (nextData: Partial<VideoTableType>) => {
    const { data, error } = await this.supabase
      .from<VideoTableType>('videos')
      .upsert({ ...nextData, user_id: this.storeAuth.user.id })
      .single()

    return { data, error }
  }
}

export default VideoApi

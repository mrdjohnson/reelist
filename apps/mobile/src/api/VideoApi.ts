import supabase from '~/supabase'

import { VideoTableType } from '~/models/Video'

class VideoApi {
  static loadVideo = async ({ userId, videoId }: { userId: string; videoId: string }) => {
    const { data, error } = await supabase
      .from<VideoTableType>('videos')
      .select('*')
      .match({ user_id: userId, video_id: videoId })
      .maybeSingle()

    return { data, error }
  }

  static updateVideo = async (nextData: Partial<VideoTableType>) => {
    const { data, error } = await supabase.from<VideoTableType>('videos').upsert(nextData).single()

    return { data, error }
  }
}

export default VideoApi

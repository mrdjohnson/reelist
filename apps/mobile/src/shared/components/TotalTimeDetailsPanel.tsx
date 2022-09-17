import React, { useMemo } from 'react'
import { Text, Column } from 'native-base'
import { IViewProps } from 'native-base/lib/typescript/components/basic/View/types'
import DetailsPanel from './DetailsPanel'
import User from '~/models/User'
import Video from '~/models/Video'
import { humanizedDuration } from '~/utils'

type TotalTimeDetailsPanelProps = IViewProps & {
  user: User
  videos: Video[]
}

const TotalTimeDetailsPanel = ({ user, videos, ...props }: TotalTimeDetailsPanelProps) => {
  const [totalDuration, totalWatchedDuration] = useMemo(() => {
    let duration = 0
    let watchedDuration = 0

    videos.forEach(video => {
      duration += video.totalDurationMinutes
      watchedDuration += video.totalWatchedDurationMinutes
    })

    return [duration, watchedDuration]
  }, [videos])

  return (
    <DetailsPanel
      {...props}
      text={'Approximate Watched Time for ' + (user.name || 'Nobody')}
      marginX="10px"
    >
      <Column>
        <Text>Approximate duration: {humanizedDuration(totalDuration)}</Text>
        <Text>Approximate watched: {humanizedDuration(totalWatchedDuration)}</Text>
        <Text>Approximate Left: {humanizedDuration(totalDuration - totalWatchedDuration)}</Text>
      </Column>
    </DetailsPanel>
  )
}

export default TotalTimeDetailsPanel

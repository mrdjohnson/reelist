import React, { useEffect, useState } from 'react'
import { Text, View, Row, Pressable, Column, ArrowBackIcon } from 'native-base'
import { observer } from 'mobx-react-lite'
import { useStore } from '@reelist/utils/hooks/useStore'
import { ReelistScreenFrom } from '~/utils/navigation'
import ActionButton from '~/components/ActionButton'
import moment from 'moment'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LoadingSection from '~/shared/components/LoadingSection'

const VideoUpdateWatchedModal = observer(
  ({ route, navigation }: ReelistScreenFrom<'videoUpdateWatchedModal'>) => {
    const { videoListStore, videoStore, appState } = useStore()

    const [backfilled, setBackfilled] = useState(false)

    const video = appState.currentVideo!
    const { videoId } = route.params

    useEffect(() => {
      if (video) return

      videoStore.getVideo(videoId).then(appState.setCurrentVideo)
    }, [video, videoId])

    useEffect(() => {
      videoListStore.getAdminVideoLists()
    }, [])

    if (!video) {
      return <LoadingSection />
    }

    const handleBackfill = () => {
      video.backfillWatched()
      setBackfilled(true)
    }

    let videoStatus

    if (video.isCompleted) {
      videoStatus = <Text>Completed</Text>
    } else if (video.isLatestEpisodeWatched) {
      videoStatus = (
        <Column>
          <Text>Currently Live</Text>

          {video.nextEpisodeToAir && (
            <Text>
              {/* Friday, Aug 19th 22 */}
              Next Air Date:
              {moment(video.nextEpisodeToAir.airDate).format(' dddd, MMM Do')}
            </Text>
          )}
        </Column>
      )
    } else {
      videoStatus = (
        <Text numberOfLines={1}>
          {`Next episode to watch: S: ${video.nextEpisode?.seasonNumber} E: ${video.nextEpisode?.episodeNumber}`}
        </Text>
      )
    }

    return (
      <View flex={1}>
        <Row
          height="45px"
          alignItems="center"
          backgroundColor="light.300:alpha.40"
          space={2}
          width="100%"
          display="flex"
          padding="10px"
          marginBottom="10px"
        >
          <Pressable onPress={navigation.goBack}>
            <ArrowBackIcon />
          </Pressable>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            textAlign="center"
            flex={1}
            backgroundColor="red.600"
          >
            {video.name}
          </Text>
        </Row>

        <View paddingX="10px">
          <Text fontSize="md">Current status: {videoStatus}</Text>

          <Text marginY="10px">Select which applies:</Text>

          <Column space="4" paddingX="10px">
            <ActionButton
              onPress={() => video.toggleWatched(false)}
              disabled={!video.lastWatchedSeasonNumber}
            >
              I have not seen this show
            </ActionButton>

            {video.nextEpisode && (
              <ActionButton
                onPress={video.watchNextEpisode}
                endIcon={<MaterialCommunityIcons name="eye-plus" />}
              >
                <Text color="blue.500" numberOfLines={1}>
                  {`I have watched S: ${video.nextEpisode?.seasonNumber} E: ${video.nextEpisode?.episodeNumber}`}
                </Text>
              </ActionButton>
            )}

            <ActionButton onPress={() => video.toggleWatched(true)} disabled={video.isCompleted}>
              I have seen this entire show
            </ActionButton>

            {video.lastWatchedSeasonNumber && !video.isCompleted && (
              <ActionButton onPress={handleBackfill} disabled={backfilled}>
                <Text color={backfilled ? 'dark.500' : 'blue.500'} numberOfLines={1}>
                  {`I have seen all the episodes before S: ${video.lastWatchedSeasonNumber} E: ${video.lastWatchedEpisodeNumber}`}
                </Text>
              </ActionButton>
            )}
          </Column>
        </View>
      </View>
    )
  },
)

export default VideoUpdateWatchedModal

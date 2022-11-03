import { AspectRatio, Row, View, Text, Column, ScrollView, Pressable } from 'native-base'
import React from 'react'
import Video from '~/models/Video'
import _ from 'lodash'
import VideoImage from '~/features/video/VideoImage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

type NamedTileRowProps = {
  videos?: Video[]
  label: string
  size?: number
  onShowMore: () => void
}

const NamedTileRow = ({ label, videos, size = 10, onShowMore }: NamedTileRowProps) => {
  if (_.isEmpty(videos)) return null

  return (
    <Column marginX="10px" paddingBottom="10px">
      <Text paddingBottom="4px" fontSize="md">
        {label}
      </Text>

      <ScrollView horizontal>
        <Row space="8px" flex={1}>
          {_.take(videos, size).map(video => (
            <VideoImage
              key={video.videoId}
              video={video}
              containerProps={{ height: '120px', width: 'auto' }}
            />
          ))}

          <Pressable backgroundColor="blue.300:alpha.20" rounded="sm" onPress={onShowMore}>
            <AspectRatio ratio={{ base: 2 / 3 }} width="100%" height="120px">
              <View textAlign="center" alignItems="center" justifyContent="center">
                <MaterialCommunityIcons
                  size={30}
                  name="chevron-double-right"
                  style={{ color: 'black', marginVertical: 'auto' }}
                />
              </View>
            </AspectRatio>
          </Pressable>
        </Row>
      </ScrollView>
    </Column>
  )
}

export default NamedTileRow

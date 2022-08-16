import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { Linking } from 'react-native'
import { useStore } from '~/hooks/useStore'
import { NavigatorParamList } from '../../from_ignite_template/app-navigator'

export const AppEventHandler = () => {
  const { appState } = useStore()
  const navigation = useNavigation<NavigationProp<NavigatorParamList>>()

  useEffect(() => {
    const { remove } = Linking.addEventListener('url', ({ url }) => {
      if (!url.includes('reelist://share/')) return

      const shareUrl = url.replace('reelist://share/', '')

      const [type, content] = shareUrl.split('/')

      switch (type) {
        case 'list': {
          console.log('navigating to videoListScreen with id:', content)

          appState.setVideoListShareId(content)
          navigation.navigate('videoListScreen')
        }
      }
    })

    return remove
  }, [appState, navigation])

  return null
}

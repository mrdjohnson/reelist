import { useToast } from 'native-base'
import { useEffect } from 'react'
import { Linking } from 'react-native'
import { useStore } from '@reelist/utils/hooks/useStore'
import { useReelistNavigation } from './navigation'

export const AppEventHandler = () => {
  const { appState, auth, supabase } = useStore()
  const navigation = useReelistNavigation()

  const toast = useToast()

  useEffect(() => {
    // example command: adb shell am start -a android.intent.action.VIEW -d "reelist://share/video/tv116244"

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

        // reelist://share/video/{videoId}
        case 'video': {
          console.log('navigating to videoScreen with id:', content)

          navigation.navigate('videoScreen', { videoId: content })
        }
      }
    })

    return remove
  }, [appState, navigation])

  // handle supabase signout / sign out
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async event => {
      if (event !== 'SIGNED_OUT') return

      auth.logout()

      navigation.navigate('discover')

      toast.show({
        description: 'You have been logged out',
      })
    })

    return () => authListener?.unsubscribe()
  }, [])

  return null
}

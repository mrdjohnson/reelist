import React, { useMemo } from 'react'
import { Avatar, Icon, IAvatarProps } from 'native-base'

import _ from 'lodash'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import User from '~/models/User'

const missingIconOptions = [
  'user-astronaut',
  'user-shield',
  'user-md',
  'user-injured',
  'user-ninja',
  'user-ninja',
  'user-secret',
  'user-secret',
  'user-secret',
]

type ProfileIconProps = IAvatarProps & {
  user: User
}

const ProfileIcon = ({ user, ...avatarProps }: ProfileIconProps) => {
  const missingUserIcon = useMemo(() => {
    return _.sample(missingIconOptions) || 'user-secret'
  }, [])

  return (
    <Avatar
      alignSelf="center"
      alignItems="center"
      source={{ uri: user.avatarUrl }}
      backgroundColor="gray.400"
      display="flex"
      {...avatarProps}
    >
      <Icon
        as={
          <FontAwesome5
            name={missingUserIcon}
            size={60}
            style={{ color: 'white', padding: 0, margin: 0 }}
          />
        }
      />
    </Avatar>
  )
}

export default ProfileIcon

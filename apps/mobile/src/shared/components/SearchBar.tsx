import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Input, Pressable, Icon, IInputProps, IIconProps } from 'native-base'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import { useReelistNavigation } from '~/utils/navigation'

type SearchBarProps = IInputProps & {
  leftIcon: IIconProps['as']
  onChangeText: (nextValue: string) => void
}

const clearIcon = <MaterialIcons name="clear" />
const settingsIcon = <MaterialIcons name="settings" />

const SearchBar = observer(({ leftIcon, onChangeText, value, ...rest }: SearchBarProps) => {
  const navigation = useReelistNavigation()
  const [isFocused, setIsFocused] = useState(false)

  let rightIcon

  if (!isFocused) {
    rightIcon = settingsIcon
  } else if (_.isEmpty(value)) {
    rightIcon = undefined
  } else {
    rightIcon = clearIcon
  }

  const handleRightIconPressed = () => {
    if (isFocused) {
      onChangeText('')
    } else {
      navigation.navigate('settings')
    }
  }

  return (
    <Input
      borderRadius="8"
      color="gray.600"
      margin="10px"
      py="2"
      px="1"
      fontSize="14"
      leftElement={<Icon m="2" ml="3" size={6} color="gray.400" as={leftIcon} />}
      rightElement={
        rightIcon && (
          <Pressable onPress={handleRightIconPressed}>
            <Icon m="2" ml="3" size={5} color="gray.400" as={rightIcon} />
          </Pressable>
        )
      }
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      isFocused={isFocused}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  )
})

export default SearchBar

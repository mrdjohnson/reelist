import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Input, Pressable, Icon, IInputProps, IIconProps } from 'native-base'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'

type SearchBarProps = IInputProps & {
  leftIcon: IIconProps['as']
  rightIconUnFocused?: IIconProps['as']
  onRightIconPress: (isFocused?: boolean) => void
}

const clearIcon = <MaterialIcons name="clear" />

const SearchBar = observer(
  ({ leftIcon, rightIconUnFocused, onRightIconPress, value, ...rest }: SearchBarProps) => {
    const [isFocused, setIsFocused] = useState(false)

    let rightIcon

    if (!isFocused) {
      rightIcon = rightIconUnFocused
    } else if (_.isEmpty(value)) {
      rightIcon = null
    } else {
      rightIcon = clearIcon
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
            <Pressable onPress={() => onRightIconPress(isFocused)}>
              <Icon m="2" ml="3" size={5} color="gray.400" as={rightIcon} />
            </Pressable>
          )
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        isFocused={isFocused}
        value={value}
        {...rest}
      />
    )
  },
)

export default SearchBar

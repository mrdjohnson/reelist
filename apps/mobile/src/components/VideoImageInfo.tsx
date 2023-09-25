import React, { PropsWithChildren, useMemo, useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Column,
  Text,
  Center,
  Input,
  useDisclose,
  MinusIcon,
  AddIcon,
  Row,
  ScrollView,
  Popover,
  Pressable,
} from 'native-base'
import PillButton from '~/components/PillButton'
import AppButton from '~/components/AppButton'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'

type StringOrNumber = string | number

export type SelectOption<T extends StringOrNumber> = { id: T; name: string; selected: boolean }

type ReelistSelectProps<T extends StringOrNumber> = PropsWithChildren<{
  label: string
  options: Array<SelectOption<T>>
  onChange: () => void
  multi?: boolean
}>

const ReelistSelect = <T extends StringOrNumber>({
  label,
  options,
  children,
  onChange,
  multi,
}: ReelistSelectProps<T>) => {
  const { isOpen, onClose, onOpen } = useDisclose()
  const [filterText, setFilterText] = useState('')

  const toggleOption = (option: SelectOption<T>) => {
    if (!multi) {
      const currentlySelectedOption = _.find(options, { selected: true })

      if (currentlySelectedOption) {
        currentlySelectedOption.selected = !currentlySelectedOption.selected
      }
    }

    option.selected = !option.selected

    onChange()
  }

  const filteredOptions = useMemo(() => {
    return _.chain(options)
      .filter(option => option.name.toLowerCase().includes(filterText.toLowerCase()))
      .take(50)
      .value()
  }, [options, filterText])

  const onPopoverClose = () => {
    onClose()
    setFilterText('')
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onPopoverClose}
      trigger={triggerProps => {
        return (
          <Pressable {...triggerProps}>
            <AppButton {...triggerProps} size="sm" minWidth="200px" margin="7px">
              <Column>
                <Text>{label}</Text>

                <Center>
                  {isOpen ? (
                    <ChevronUpIcon color="gray.300" />
                  ) : (
                    <ChevronDownIcon color="gray.300" />
                  )}
                </Center>
              </Column>
            </AppButton>
          </Pressable>
        )
      }}
    >
      <Popover.Content marginX="10px">
        <Popover.Arrow />
        {isOpen && (
          <>
            <Popover.CloseButton />
            <Popover.Header>{label + ':'}</Popover.Header>

            <Popover.Body
              maxHeight="0.7 * 100vh"
              maxWidth="0.7 * 100vw"
              width="500px"
              height="500px"
            >
              <Row width="100%">
                <Column flex={1} alignItems="center" backgroundColor="gray:200">
                  <Row paddingY="5px" width="100%">
                    <Input
                      placeholder="Search"
                      flex={1}
                      value={filterText}
                      onChangeText={setFilterText}
                    />
                  </Row>

                  <Row width="100%" justifyContent="center" marginY="5px">
                    {children}
                  </Row>
                </Column>
              </Row>

              <ScrollView
                contentContainerStyle={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }}
                removeClippedSubviews
                width="100%"
                height="100%"
              >
                {filteredOptions.map(option => (
                  <RenderSelectOption key={option.id} option={option} toggleOption={toggleOption} />
                ))}

                <Row width="480px">
                  {options.length > 100 && !filterText && (
                    <Text color="gray.500">
                      Not seeing what you're looking for? Try searching to show hidden options
                    </Text>
                  )}
                </Row>
              </ScrollView>
            </Popover.Body>
          </>
        )}
      </Popover.Content>
    </Popover>
  )
}

export default ReelistSelect

const RenderSelectOption = observer(
  <T extends StringOrNumber>({
    option,
    toggleOption,
  }: {
    option: SelectOption<T>
    toggleOption: (nextOption: typeof option) => void
  }) => {
    const pillButtonProps = option.selected
      ? { RightIcon: MinusIcon, darknessLevel: 20 }
      : { RightIcon: AddIcon, darknessLevel: 100 }

    return (
      <PillButton
        key={option.id}
        label={option.name}
        rightIcon={<pillButtonProps.RightIcon style={{ transform: [{ scale: 0.9 }] }} />}
        onPress={() => toggleOption(option)}
        marginRight="5px"
        marginBottom="5px"
        darknessLevel={pillButtonProps.darknessLevel}
      />
    )
  },
)

import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
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
import PillButton from '@reelist/components/PillButton'
import AppButton from '@reelist/components/AppButton'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { makeAutoObservable } from 'mobx'
import { useStore } from '@reelist/utils/hooks/useStore'
import { IStorage } from '~/utils/storage'

type StringOrNumber = string | number

export type SelectOption<T extends StringOrNumber> = { id: T; name: string; selected?: boolean }

export class SelectState<T extends StringOrNumber> {
  selectedOptions: Array<T> = []
  storageKey: string
  options: Array<SelectOption<T>>

  constructor(
    public label: string,
    public loadOptions: () => Promise<Array<SelectOption<T>>>,
    private storage: IStorage,
    private alternativeDefaultOptions?: () => T[],
    private isMulti: boolean = true,
  ) {
    console.log('is multi: ', isMulti)
    loadOptions().then(nextOptions => (this.options = nextOptions))
    this.storageKey = _.snakeCase(label)

    this.lazyLoadFromStorage()

    makeAutoObservable(this)
  }

  lazyLoadFromStorage = async () => {
    const defaultKey = this.storageKey

    const storedValues = await this.storage.load<T[]>(defaultKey)

    console.log('loaded ' + defaultKey + ':', storedValues)

    if (storedValues != null) {
      this.selectedOptions.push(...storedValues)
    }

    if (this.alternativeDefaultOptions) {
      this.selectedOptions.push(...this.alternativeDefaultOptions())
    }

    if (!this.isMulti && !_.isEmpty(this.selectedOptions)) {
      this.selectedOptions = [this.selectedOptions[0]]
    }
  }

  toggleOption = (option: SelectOption<T>) => {
    const selected = this.selectedOptions
    const removingOption = selected.includes(option.id)

    if (this.isMulti) {
      this.selectedOptions = _.xor(this.selectedOptions, [option.id])
      // if this is not multi select, there should always be a selected option
    } else if (!removingOption) {
      this.selectedOptions = [option.id]
    }

    this.storage.save(this.storageKey, selected)
  }
}

export const useSelectState = <T extends StringOrNumber>(
  label: string,
  loadOptions: () => Promise<Array<SelectOption<T>>>,
  config: { getAlternativeDefaults?: () => T[]; isMulti?: boolean } = {},
) => {
  const { storage } = useStore()

  const [selectState] = useState<SelectState<T>>(() => {
    return new SelectState(
      label,
      loadOptions,
      storage,
      config.getAlternativeDefaults,
      config.isMulti,
    )
  })

  return selectState
}

type ReelistSelectProps<T extends StringOrNumber> = PropsWithChildren<{
  selectState: SelectState<T>
}>

const ReelistSelect = observer(
  <T extends StringOrNumber>({ selectState, children }: ReelistSelectProps<T>) => {
    const { isOpen, onClose, onOpen } = useDisclose()
    const [filterText, setFilterText] = useState('')
    const { label, options, selectedOptions, toggleOption } = selectState || {}

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

    const renderOption = (option: SelectOption<T>, isChecked) => {
      const pillButtonProps = isChecked
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
    }

    return (
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onPopoverClose}
        trigger={triggerProps => {
          return (
            <Pressable {...triggerProps} rounded="full" margin="7px">
              <AppButton {...triggerProps} size="sm" minWidth="200px" isLoading={!label}>
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
                  contentContainerStyle={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                  }}
                  removeClippedSubviews
                  width="100%"
                  height="100%"
                >
                  {filteredOptions.map(option => {
                    const isChecked = selectedOptions.includes(option.id)
                    return renderOption(option, isChecked)
                  })}

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
  },
)

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

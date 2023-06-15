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
  IPressableProps,
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
  selectedOptions: Record<StringOrNumber, string> = {}
  storageKey: string
  options: Array<SelectOption<T>>

  constructor(
    public label: string,
    public loadOptions: () => Promise<Array<SelectOption<T>>>,
    private storage: IStorage,
    private alternativeDefaultOptions?: () => Array<string>,
    public isMulti: boolean = true,
  ) {
    console.log('is multi: ', isMulti)
    this.storageKey = _.snakeCase(label)

    loadOptions().then(nextOptions => {
      this.options = nextOptions
      this.lazyLoadFromStorage()

      makeAutoObservable(this)
    })
  }

  lazyLoadFromStorage = async () => {
    const defaultKey = this.storageKey

    const storedValues = await this.storage.load<typeof this.selectedOptions>(defaultKey)

    console.log('loaded ' + defaultKey + ':', storedValues)

    if (!_.isEmpty(storedValues)) {
      this.selectedOptions = storedValues

      return
    }

    if (this.alternativeDefaultOptions) {
      const defaultIds = this.alternativeDefaultOptions()
      const allOptionsById = _.chain(this.options).keyBy('id').mapValues('name').value()

      const options = {}

      if (this.isMulti) {
        defaultIds.forEach(id => {
          if (allOptionsById[id]) {
            options[id] = allOptionsById[id]
          }
        })
      } else {
        const [id] = defaultIds
        options[id] = allOptionsById[id]
      }

      this.selectedOptions = options

      this.save()
    }

    if (!this.isMulti && !_.isEmpty(this.selectedOptions)) {
      // todo:
      // this.selectedOptions = {0: this.selectedOptions[0]}
    }
  }

  toggleOption = (option: SelectOption<T>) => {
    const removingOption = !!this.selectedOptions[option.id]

    if (this.isMulti) {
      if (removingOption) return this.removeOption(option.id)

      this.selectedOptions[option.id] = option.name
      // if this is not multi select, there should always be a selected option
    } else if (!removingOption) {
      this.selectedOptions = { [option.id]: option.name }
    }

    this.save()
  }

  removeOption = (optionId: StringOrNumber) => {
    delete this.selectedOptions[optionId]

    this.save()
  }

  save = () => {
    this.storage.save(this.storageKey, this.selectedOptions)
  }
}

export const useSelectState = <T extends StringOrNumber>(
  label: string,
  loadOptions: () => Promise<Array<SelectOption<T>>>,
  config: { getAlternativeDefaults?: () => Array<string>; isMulti?: boolean } = {},
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

type ReelistSelectProps<T extends StringOrNumber> = IPressableProps & {
  selectState: SelectState<T>
}

const ReelistSelect = observer(
  <T extends StringOrNumber>({
    selectState,
    children,
    ...containerProps
  }: ReelistSelectProps<T>) => {
    const { isOpen, onClose, onOpen } = useDisclose()
    const [filterText, setFilterText] = useState('')
    const { label, options, selectedOptions, toggleOption, isMulti } = selectState || {}

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
      const pillButtonIconStyle = { transform: [{ scale: 0.9 }], paddingLeft: '21px' }
      const variant = isChecked ? 'solid' : 'outline'
      let pillButtonProps

      if (!isMulti) {
        pillButtonProps = {
          rounded: 'sm',
          borderWidth: 0,
          variant,
          width: '100%',
          textAlign: 'left',
        }
      } else if (isChecked) {
        pillButtonProps = {
          rightIcon: <MinusIcon style={pillButtonIconStyle} color="inherit" />,
          variant,
        }
      } else {
        pillButtonProps = {
          rightIcon: <AddIcon style={pillButtonIconStyle} color="inherit" />,
          variant,
        }
      }

      return (
        <PillButton
          key={option.id}
          label={option.name}
          onPress={() => toggleOption(option)}
          variant={pillButtonProps.variant}
          {...pillButtonProps}
        />
      )
    }

    return (
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onPopoverClose}
        placement="bottom left"
        trigger={triggerProps => {
          const paddingLeft = selectState.isMulti ? '21px' : '0'

          return (
            <Pressable {...triggerProps} {...containerProps} rounded="full">
              <AppButton
                {...triggerProps}
                isLoading={!label}
                variant={selectState.isMulti ? 'solid' : 'link'}
                endIcon={() =>
                  isOpen ? (
                    <ChevronUpIcon color="inherit" paddingLeft={paddingLeft} />
                  ) : (
                    <ChevronDownIcon color="inherit" paddingLeft={paddingLeft} />
                  )
                }
                height="40px"
              >
                {selectState.isMulti ? label : _.values(selectedOptions)[0]}
              </AppButton>
            </Pressable>
          )
        }}
      >
        <Popover.Content marginX="10px">
          <Popover.Arrow background="#1D1D1D" />

          {isOpen && (
            <Popover.Body
              maxHeight="0.7 * 100vh"
              maxWidth="0.7 * 100vw"
              width={isMulti ? '600px' : 'auto'}
              height={isMulti ? '350px' : 'auto'}
              backgroundColor="#1D1D1D"
            >
              <ScrollView
                contentContainerStyle={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: isMulti && 'row',
                  gap: 10,
                  paddingX: isMulti ? undefined : '0px',
                }}
                removeClippedSubviews
                width={isMulti ? '100%' : 'auto'}
                height={isMulti ? '100%' : 'auto'}
              >
                {selectState.isMulti && (
                  <Row width="100%">
                    <Column flex={1} alignItems="center" backgroundColor="gray:200">
                      <Row paddingY="5px" width="100%">
                        <Input
                          placeholder="Filter"
                          flex={1}
                          value={filterText}
                          onChangeText={setFilterText}
                          colorScheme="reelist"
                          variant="underlined"
                          placeholderTextColor="light.200"
                          size="md"
                        />
                      </Row>

                      <Row width="100%" justifyContent="center" marginY="5px">
                        {children}
                      </Row>
                    </Column>
                  </Row>
                )}

                {filteredOptions.map(option => {
                  const isChecked = selectedOptions[0] === option.id || !!selectedOptions[option.id]
                  return renderOption(option, isChecked)
                })}

                {options.length > 100 && !filterText && (
                  <Row width="480px">
                    <Text color="gray.500">
                      Not seeing what you're looking for? Try searching to show hidden options
                    </Text>
                  </Row>
                )}
              </ScrollView>
            </Popover.Body>
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

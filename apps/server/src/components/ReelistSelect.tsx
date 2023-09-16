import React, { PropsWithChildren, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { makeAutoObservable } from 'mobx'
import { useStore } from '@reelist/utils/hooks/useStore'
import { IStorage } from '~/utils/storage'
import { Button, Link, Popover, TextField } from '@mui/material'
import classNames from 'classnames'
import PillButton from 'apps/server/components/PillButton'
import DashIcon from 'apps/server/components/heroIcons/DashIcon'
import PlusIcon from 'apps/server/components/heroIcons/PlusIcon'

export type StringOrNumber = string | number

export type SelectOption<T extends StringOrNumber> = {
  id: T
  name: string
  selected?: boolean
  icon?: ReactNode
}

export class SelectState<T extends StringOrNumber> {
  selectedOptions: Record<StringOrNumber, string> = {}
  storageKey: string
  options: Array<SelectOption<T>>
  isLoadedFromSave: boolean = false

  constructor(
    public label: string,
    public loadOptions: () => Promise<Array<SelectOption<T>>>,
    private storage: IStorage,
    private alternativeDefaultOptions?: () => Array<string>,
    public isMulti: boolean = true,
  ) {
    console.log('is multi: ', isMulti)
    this.storageKey = _.snakeCase(label)
    
    makeAutoObservable(this)

    loadOptions().then(nextOptions => {
      this.options = nextOptions
      this.lazyLoadFromStorage()
    })
  }

  setSelectedOptions = (options: string []) => {
    const allOptionsById = _.chain(this.options).keyBy('id').mapValues('name').value()

    const nextOptions = {}

    if (this.isMulti) {
      options.forEach(id => {
        if (allOptionsById[id]) {
          nextOptions[id] = allOptionsById[id]
        }
      })
    } else {
      const [id] = options
      options[id] = allOptionsById[id]
    }

    this.selectedOptions = nextOptions

    this.save()
  }

  lazyLoadFromStorage = async () => {
    const defaultKey = this.storageKey

    const storedValues = await this.storage.load<typeof this.selectedOptions>(defaultKey)

    console.log('loaded ' + defaultKey + ':', storedValues)

    if (!_.isEmpty(storedValues)) {
      this.selectedOptions = storedValues

      this.isLoadedFromSave = true

      return
    }

    if (this.alternativeDefaultOptions) {
      this.setSelectedOptions(this.alternativeDefaultOptions())
    }

    if (!this.isMulti && !_.isEmpty(this.selectedOptions)) {
      // todo:
      // this.selectedOptions = {0: this.selectedOptions[0]}
    }

    this.isLoadedFromSave = true
  }

  toggleOption = (option: SelectOption<T>) => {
    const removingOption = !!this.selectedOptions[option.id]

    if (this.isMulti) {
      if (removingOption) return this.removeOption(option.id)

      this.selectedOptions = { ...this.selectedOptions, [option.id]: option.name }
      // if this is not multi select, there should always be a selected option
    } else if (!removingOption) {
      this.selectedOptions = { [option.id]: option.name }
    }

    this.save()
  }

  removeOption = (optionId: StringOrNumber) => {
    this.selectedOptions = _.omit(this.selectedOptions, optionId)

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

type ReelistSelectProps<T extends StringOrNumber> = PropsWithChildren<{
  selectState: SelectState<T>
  disabled: boolean
}>

const ReelistSelect = observer(
  <T extends StringOrNumber>({ selectState, children, disabled }: ReelistSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false)
    const [filterText, setFilterText] = useState('')
    const { label, options = [], selectedOptions, toggleOption, isMulti } = selectState || {}
    const buttonRef = useRef<HTMLButtonElement>(null)

    const filteredOptions = useMemo(() => {
      return _.chain(options)
        .filter(option => option.name.toLowerCase().includes(filterText.toLowerCase()))
        .value()
    }, [options, filterText])

    const onPopoverClose = () => {
      setIsOpen(false)
      setFilterText('')
    }

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    const renderOption = (option: SelectOption<T>, isChecked) => {
      let singleSelect = false

      let icon
      let remove = false
      let add = false

      if (!isMulti) {
        singleSelect = true
      } else if (isChecked) {
        remove = true

        icon = <DashIcon />
      } else {
        add = true
        icon =  <PlusIcon />
      }

      return (
        <PillButton
          key={option.id}
          label={option.name}
          className={classNames('border-reelist-red font-semibold', {
            'hover:bg-reelist-red rounded-md text-white hover:text-black border-none': singleSelect,
            ' bg-reelist-red text-black hover:text-white': remove,
            ' hover:text-reelist-red  bg-black bg-opacity-30 text-white': add,
          })}
          onClick={() => toggleOption(option)}
          rightIcon={icon}
        />
      )
    }

    return (
      <>
        {selectState.isMulti ? (
          <Button
            className={
              'font-inter group flex w-fit justify-start self-center rounded-l-full rounded-r-full pl-4 pr-2 text-left align-baseline text-lg font-semibold text-black hover:text-white' +
              (disabled ? ' pointer-events-none bg-gray-500 opacity-40' : ' bg-reelist-red ')
            }
            onClick={() => setIsOpen(true)}
            aria-describedby={label}
            ref={buttonRef}
            disableRipple
          >
            {label}

            {/* chevron icon */}
            <svg
              viewBox="0 0 16 11"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className={
                'ml-2 h-3 w-3 transition-transform duration-200 ' + (isOpen && '-rotate-90 ')
              }
            >
              <path d="M7.60536 10.7899C7.82333 11.07 8.17667 11.07 8.39465 10.7899L15.8365 1.22464C15.9961 1.01949 16.0439 0.710927 15.9575 0.442861C15.8711 0.174785 15.6676 0 15.4419 0H0.558157C0.332408 0 0.128896 0.174785 0.0425036 0.442861C-0.0438888 0.710927 0.00386559 1.01949 0.163493 1.22464L7.60536 10.7899Z" />
            </svg>
          </Button>
        ) : (
          <div className="flex flex-col justify-end">
            <Button
              className={
                'font-inter group w-fit text-right text-lg  hover:bg-transparent ' +
                (disabled ? ' pointer-events-none text-gray-500 opacity-40' : ' text-white')
              }
              onClick={() => setIsOpen(true)}
              aria-describedby={label}
              ref={buttonRef}
              disableRipple
            >
              <div className="transition-color flex  items-center justify-center border-0 border-b border-solid border-transparent duration-200 group-hover:border-white">
                {_.values(selectedOptions)[0]}

                {/* chevron icon */}
                <svg
                  viewBox="0 0 16 11"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className={
                    'ml-2 h-3 w-2 transition-transform duration-200 ' + (isOpen && '-rotate-90 ')
                  }
                >
                  <path d="M7.60536 10.7899C7.82333 11.07 8.17667 11.07 8.39465 10.7899L15.8365 1.22464C15.9961 1.01949 16.0439 0.710927 15.9575 0.442861C15.8711 0.174785 15.6676 0 15.4419 0H0.558157C0.332408 0 0.128896 0.174785 0.0425036 0.442861C-0.0438888 0.710927 0.00386559 1.01949 0.163493 1.22464L7.60536 10.7899Z" />
                </svg>
              </div>
            </Button>
          </div>
        )}

        <Popover
          id={label}
          open={isOpen}
          anchorEl={buttonRef.current}
          onClose={onPopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          PaperProps={{
            className: 'bg-transparent-dark backdrop-blur-md ',
          }}
        >
          <div
            className={classNames(
              'no-scrollbar relative mt-3 flex overflow-y-scroll overscroll-none ',
              {
                'max-h-500 h-full w-full max-w-[600px] flex-col ': selectState.isMulti,
                '!mt-0 h-fit w-fit flex-row rounded-md': !selectState.isMulti,
              },
            )}
          >
            <div className="p-3">
              {selectState.isMulti && (
                <div className="x-3">
                  <input
                    className="focus:shadow-outline border-reelist-red mb-4 w-full appearance-none border-0 border-b bg-transparent py-2 text-lg leading-tight text-gray-300 shadow outline-none"
                    type="text"
                    autoComplete="off"
                    placeholder="Filter"
                    onChange={e => setFilterText(e.target.value)}
                  />
                </div>
              )}

              {children && <div className="w-full">{children}</div>}

              <div
                className={
                  'my-3 flex w-full flex-wrap gap-3 ' +
                  (!selectState.isMulti && ' !my-0 flex-col rounded-md')
                }
              >
                {filteredOptions.map(option => {
                  const isChecked = selectedOptions[0] === option.id || !!selectedOptions[option.id]
                  return renderOption(option, isChecked)
                })}
              </div>
            </div>
          </div>
        </Popover>
      </>
    )
  },
)

export default ReelistSelect

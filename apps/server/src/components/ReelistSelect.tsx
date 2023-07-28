import React, { PropsWithChildren, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { makeAutoObservable } from 'mobx'
import { useStore } from '@reelist/utils/hooks/useStore'
import { IStorage } from '~/utils/storage'
import { Button, Link, Popover, TextField } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export type StringOrNumber = string | number

export type SelectOption<T extends StringOrNumber> = { id: T; name: string; selected?: boolean, icon?: ReactNode }

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

        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
          </svg>
        )
      } else {
        add = true
        icon = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
          </svg>
        )
      }

      return (
        <Button
          key={option.id}
          className={
            (singleSelect && 'hover:bg-reelist-red rounded-md text-white hover:text-black') ||
            (remove &&
              'bg-reelist-red rounded-l-full rounded-r-full text-black hover:text-white') ||
            (add &&
              'border-reelist-red hover:text-reelist-red rounded-l-full rounded-r-full border border-solid bg-black bg-opacity-30 text-white')
          }
          onClick={() => toggleOption(option)}
        >
          {option.name}

          {icon}
        </Button>
      )
    }

    return (
      <>
        {selectState.isMulti ? (
          <Button
            className={
              'font-inter group flex w-fit justify-start self-center rounded-l-md rounded-r-md pl-4 pr-2 text-left align-baseline text-lg text-black hover:text-white' +
              (disabled ? ' pointer-events-none bg-gray-500 opacity-40' : ' bg-reelist-red ')
            }
            onClick={() => setIsOpen(true)}
            aria-describedby={label}
            ref={buttonRef}
            disableRipple
          >
            {label}

            {/* close icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={
                'ml-2 h-5 w-5 transition-transform duration-200 ' + (isOpen && '-rotate-90 ')
              }
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
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

                {/* close icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={
                    'ml-2 h-4 w-5 transition-transform duration-200 ' + (isOpen && '-rotate-90 ')
                  }
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
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
            className={
              'no-scrollbar relative mt-3 flex overflow-y-scroll overscroll-none ' +
              (selectState.isMulti
                ? 'max-h-500 h-full w-full max-w-[600px] flex-col '
                : 'mt-0 h-fit w-fit flex-row rounded-md')
            }
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
                  (!selectState.isMulti && ' flex-col rounded-md')
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

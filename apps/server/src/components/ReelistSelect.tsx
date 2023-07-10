import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { makeAutoObservable } from 'mobx'
import { useStore } from '@reelist/utils/hooks/useStore'
import { IStorage } from '~/utils/storage'
import { Button, Link, Popover, TextField } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

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

    const renderOption = (option: SelectOption<T>, isChecked) => {
      let singleSelect = false

      let icon
      let remove = false
      let add = false

      if (!isMulti) {
        singleSelect = true
      } else if (isChecked) {
        icon = <RemoveIcon className="pl-4" />
        remove = true
      } else {
        icon = <AddIcon className="pl-4" />
        add = true
      }

      return (
        <Button
          key={option.id}
          className={classNames({
            'hover:bg-reelist-red rounded-md text-white hover:text-black': singleSelect,
            'bg-reelist-red rounded-l-full rounded-r-full text-black hover:text-white': remove,
            'border-reelist-red hover:text-reelist-red rounded-l-full rounded-r-full border border-solid bg-black bg-opacity-30 text-white':
              add,
          })}
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
            className={classNames(
              'bg-reelist-red font-inter group flex w-fit justify-start self-center rounded-l-full rounded-r-full pl-4 pr-2 text-left align-baseline text-lg text-black hover:text-white',
              {
                'pointer-events-none bg-gray-500 opacity-40': disabled,
              },
            )}
            onClick={() => setIsOpen(true)}
            aria-describedby={label}
            ref={buttonRef}
          >
            {label}

            <ExpandMoreIcon className=" h-full pl-4 text-center align-baseline text-2xl" />
          </Button>
        ) : (
          <div className="flex flex-col justify-end">
            <Button
              className={classNames(
                'font-inter group w-fit text-right text-lg text-white hover:bg-transparent ',
                {
                  'pointer-events-none border-gray-500 text-gray-500 opacity-40': disabled,
                },
              )}
              onClick={() => setIsOpen(true)}
              aria-describedby={label}
              ref={buttonRef}
              disableRipple
            >
              <div className="flex items-center  justify-center border-0 border-b border-solid border-transparent group-hover:border-white ">
                {_.values(selectedOptions)[0]}

                <ExpandMoreIcon className=" h-full justify-self-center pl-4 text-center align-baseline text-2xl " />
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
            className: 'bg-transparent ',
          }}
        >
          <div
            className={classNames(
              'no-scrollbar relative mt-3 flex overflow-y-scroll overscroll-none bg-black bg-opacity-30 p-3 text-green-300 backdrop-blur-md',
              {
                'h-[500px] w-[600px] flex-col ': selectState.isMulti,
                'mt-0 h-fit w-fit flex-row rounded-md': !selectState.isMulti,
              },
            )}
          >
            {selectState.isMulti && (
              <div className="mx-3">
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
              className={classNames('my-3 flex w-full flex-wrap gap-3', {
                'flex-col rounded-md': !selectState.isMulti,
              })}
            >
              {filteredOptions.map(option => {
                const isChecked = selectedOptions[0] === option.id || !!selectedOptions[option.id]
                return renderOption(option, isChecked)
              })}
            </div>

            <div className="absolute top-0 -z-10 h-[calc(100%+1px)] w-full bg-transparent" />
          </div>
        </Popover>
      </>
    )
  },
)

export default ReelistSelect

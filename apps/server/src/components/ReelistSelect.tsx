import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Button, Popover } from '@mui/material'
import classNames from 'classnames'
import PillButton from 'apps/server/components/PillButton'
import DashIcon from 'apps/server/components/heroIcons/DashIcon'
import PlusIcon from 'apps/server/components/heroIcons/PlusIcon'
import { SelectState, SelectOption } from '@reelist/utils/hooks/useSelectState'

type ReelistSelectProps<T extends SelectOption> = PropsWithChildren<{
  selectState: SelectState<T>
  disabled: boolean
}>

const ReelistSelect = observer(
  <T extends SelectOption>({ selectState, children, disabled }: ReelistSelectProps<T>) => {
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

    const renderOption = (option: T, isChecked) => {
      return (
        <PillButton
          key={option.id}
          label={option.name}
          className="!rounded-md"
          onClick={() => toggleOption(option)}
          rightIcon={isChecked ? <DashIcon /> : <PlusIcon />}
          inverted={isChecked}
          noBorder={!isMulti}
        />
      )
    }

    const Chevron = (
      <svg
        viewBox="0 0 16 11"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={'ml-2 h-3 w-3 transition-transform duration-200 ' + (isOpen && '-rotate-90 ')}
      >
        <path d="M7.60536 10.7899C7.82333 11.07 8.17667 11.07 8.39465 10.7899L15.8365 1.22464C15.9961 1.01949 16.0439 0.710927 15.9575 0.442861C15.8711 0.174785 15.6676 0 15.4419 0H0.558157C0.332408 0 0.128896 0.174785 0.0425036 0.442861C-0.0438888 0.710927 0.00386559 1.01949 0.163493 1.22464L7.60536 10.7899Z" />
      </svg>
    )

    return (
      <>
        {selectState.isMulti ? (
          <PillButton
            label={label}
            rightIcon={Chevron}
            onClick={() => setIsOpen(true)}
            aria-describedby={label}
            pillButtonRef={buttonRef}
            solid
            disableRipple
          />
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

                <div className=" scale-75">{Chevron}</div>
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
                  'my-3 flex w-full flex-wrap gap-x-1 ' +
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

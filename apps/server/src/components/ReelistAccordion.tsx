import React, { PropsWithChildren, useMemo, useRef, createContext, useContext } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import { Button } from '@mui/material'
import { SelectOption, SelectState, StringOrNumber } from './ReelistSelect'

const HEADER_HEIGHT = 41

type SubSectionContextType = {
  scrollToElement: (element: HTMLElement, index: number) => void
}

const ReelistAccordionContext = createContext<SubSectionContextType>({
  scrollToElement: () => null,
})

export const useReelistAccordionContext = () => useContext(ReelistAccordionContext)

type ReelistAccordionSectionProps<T extends StringOrNumber> = PropsWithChildren<{
  selectState: SelectState<T>
  index: number
  totalCount: number
  filterText: string
}>

const ReelistAccordionSection = observer(
  <T extends StringOrNumber>({
    selectState,
    children,
    index,
    totalCount,
    filterText = '',
  }: ReelistAccordionSectionProps<T>) => {
    const labelRef = useRef(null)
    const { scrollToElement } = useReelistAccordionContext()

    const { label, options = [], selectedOptions, toggleOption, isMulti } = selectState || {}

    const filteredOptions = useMemo(() => {
      return _.chain(options)
        .filter(option => option.name.toLowerCase().includes(filterText.toLowerCase()))
        .take(30)
        .value()
    }, [options, filterText])

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
            'p-3 ' +
            ((singleSelect &&
              'rounded-l-full rounded-r-full ' +
                (isChecked ? ' bg-reelist-red  text-black ' : 'text-white')) ||
              (remove && 'bg-reelist-red rounded-l-full rounded-r-full text-black') ||
              (add &&
                'border-reelist-red rounded-l-full rounded-r-full border border-solid bg-black bg-opacity-30 text-white'))
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
        <div
          className={
            'bg-transparent-dark sticky z-10 m-0 w-full border-0 border-b border-solid border-gray-100 border-opacity-50 p-2 backdrop-blur-lg ' +
            (_.isEmpty(filteredOptions) ? 'text-gray-500' : 'text-white')
          }
          style={{
            bottom: (totalCount - (index + 1)) * HEADER_HEIGHT + 'px',
            top: index * HEADER_HEIGHT + 'px',
          }}
          onClick={() => scrollToElement(labelRef.current, index)}
        >
          {label}
        </div>

        <div className={'p-3'} ref={labelRef}>
          {children && <div className="w-full pb-1">{children}</div>}

          <div className="my-3 flex w-full flex-wrap gap-3 ">
            {filteredOptions.map(option => {
              const isChecked = selectedOptions[0] === option.id || !!selectedOptions[option.id]
              return renderOption(option, isChecked)
            })}
          </div>
        </div>
      </>
    )
  },
)

const ReelistAccordion = observer(({ children }) => {
  const scrollingDivRef = useRef(null)

  const scrollToElement = (element: HTMLElement, index: number) => {
    const div = scrollingDivRef.current
    if (!div) return

    div.scroll({
      top: element.offsetTop - HEADER_HEIGHT - index * HEADER_HEIGHT,
      behavior: 'smooth',
    })
  }

  return (
    <ReelistAccordionContext.Provider value={{ scrollToElement }}>
      <div ref={scrollingDivRef} className="relative h-fit overflow-scroll">
        {children}
      </div>
    </ReelistAccordionContext.Provider>
  )
})

export { ReelistAccordionSection }

export default ReelistAccordion

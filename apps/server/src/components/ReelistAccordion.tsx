import React, {
  PropsWithChildren,
  useMemo,
  useRef,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import SelectState, { SelectOption } from '@reelist/utils/SelectState'
import DashIcon from 'apps/server/components/heroIcons/DashIcon'
import PlusIcon from 'apps/server/components/heroIcons/PlusIcon'
import PillButton from 'apps/server/components/PillButton'
import classNames from 'classnames'

const HEADER_HEIGHT = 45

type SubSectionContextType = {
  scrollToElement: (element: HTMLElement, index: number) => void
}

const ReelistAccordionContext = createContext<SubSectionContextType>({
  scrollToElement: () => null,
})

export const useReelistAccordionContext = () => useContext(ReelistAccordionContext)

type SelectedStatePropType<T extends SelectOption> = {
  selectState: SelectState<T>
  label?: never
}

type SelectedOptionsPropType = {
  selectState?: never
  label: string
}

type ReelistAccordionSectionProps<T extends SelectOption> = PropsWithChildren<
  {
    index: number
    totalCount: number
    filterText: string
  } & (SelectedStatePropType<T> | SelectedOptionsPropType)
>

const ReelistAccordionSection = observer(
  <T extends SelectOption>({
    selectState,
    label: presetLabel,
    children,
    index,
    totalCount,
    filterText = '',
  }: ReelistAccordionSectionProps<T>) => {
    const labelRef = useRef(null)
    const { scrollToElement } = useReelistAccordionContext()

    const { selectedOptions, options = [], toggleOption, isMulti } = selectState || {}
    const label = selectState?.label || presetLabel

    const filteredOptions = useMemo(() => {
      return _.chain(options)
        .filter(option => option.name.toLowerCase().includes(filterText.toLowerCase()))
        .take(30)
        .value()
    }, [options, filterText])

    const renderOption = (option: T, isChecked) => {
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
        icon = <PlusIcon />
      }

      return (
        <PillButton
          key={option.id}
          label={option.name}
          onClick={() => toggleOption(option)}
          rightIcon={icon}
          inverted={isChecked}
        />
      )
    }

    const hasFilteredOptions = !_.isEmpty(filteredOptions)
    const hadContent = options.length > 0
    const hasContent = (!hadContent && children) || hasFilteredOptions
    const contentIsEmpty = hadContent && !hasFilteredOptions

    return (
      <>
        {label && (
          <div
            className={
              'sticky z-10 m-0 w-full border-0 border-b border-solid border-gray-100 border-opacity-50 bg-black p-2 text-lg  ' +
              (contentIsEmpty ? 'text-gray-500' : 'text-white')
            }
            style={{
              bottom: (totalCount - (index + 1)) * HEADER_HEIGHT + 'px',
              top: index * HEADER_HEIGHT + 'px',
            }}
            onClick={() => scrollToElement(labelRef.current, index)}
          >
            {label} {contentIsEmpty && ' (Empty)'}
          </div>
        )}

        {hasContent && (
          <div className="p-3" ref={labelRef}>
            {children && <div className="w-full pb-1">{children}</div>}

            {hasFilteredOptions && (
              <div
                className={classNames('my-3 w-full gap-3', {
                  'flex w-full flex-wrap': isMulti,
                  grid: !isMulti,
                })}
              >
                {filteredOptions.map(option => {
                  const isChecked = selectedOptions[0] === option.id || !!selectedOptions[option.id]
                  return renderOption(option, isChecked)
                })}
              </div>
            )}
          </div>
        )}
      </>
    )
  },
)

type ReelistAccordionProps = PropsWithChildren<{
  header: ReactNode
}>

const ReelistAccordion = observer(({ header, children }: ReelistAccordionProps) => {
  const scrollingDivRef = useRef(null)

  const scrollToElement = (element: HTMLElement, index: number) => {
    if (!element) return

    const div = scrollingDivRef.current
    if (!div) return

    div.scroll({
      top: element.offsetTop - HEADER_HEIGHT - index * HEADER_HEIGHT,
      behavior: 'smooth',
    })
  }

  return (
    <ReelistAccordionContext.Provider value={{ scrollToElement }}>
      {header}

      <div ref={scrollingDivRef} className="no-scrollbar relative h-fit overflow-scroll">
        {children}
      </div>
    </ReelistAccordionContext.Provider>
  )
})

export { ReelistAccordionSection }

export default ReelistAccordion

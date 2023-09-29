import { ReactNode, useState } from 'react'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { useStore } from '@reelist/utils/hooks/useStore'
import { IStorage } from '~/utils/storage'

export type SelectOption = {
  id: string
  name: string
  selected?: boolean
  icon?: ReactNode
}

export class SelectState<T extends SelectOption> {
  selectedOptions: Record<string, string> = {}
  storageKey: string
  options: Array<T>
  private allOptions: Array<T>
  isLoadedFromSave: boolean = false

  constructor(
    public label: string,
    public loadOptions: () => Promise<Array<T>>,
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

  setSelectedOptions = (options: string[]) => {
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
      nextOptions[id] = allOptionsById[id]
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

    this.isLoadedFromSave = true
  }

  toggleOption = (option: T) => {
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

  setOptionsFilter = (filter?: (option: T) => boolean) => {
    this.allOptions ||= this.options
    this.options = _.filter(this.allOptions, filter)

    // remove any selected options that no longer pass the filter
    this.setSelectedOptions(_.map(this.selectedOptions, 'id'))
  }

  removeOption = (optionId: string) => {
    this.selectedOptions = _.omit(this.selectedOptions, optionId)

    this.save()
  }

  save = () => {
    this.storage.save(this.storageKey, this.selectedOptions)
  }
}

const useSelectState = <T extends SelectOption>(
  label: string,
  loadOptions: () => Promise<Array<T>>,
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

export default useSelectState

export function classFromProps<T>(klass = class {}) {
  return class extends klass {
    constructor(props: T) {
      super()

      Object.assign(this, props)

      //   DO NOT CALL MAKE AUTO OBSERVABLE HERE.
    }
  } as { new (args: T): T }
}

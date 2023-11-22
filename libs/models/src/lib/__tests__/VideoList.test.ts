import { mockServer } from '@reelist/apis/__testHelpers__/apiTestHelper'
import { userFactory } from '@reelist/models/__factories__/UserFactory'

import { videoListFactory } from '@reelist/models/__factories__/VideoListFactory'
import VideoList from '@reelist/models/VideoList'

import { autorun, extendObservable, makeAutoObservable, makeObservable, observe } from 'mobx'

import { observable, computed, action, configure } from 'mobx'
import { observer } from 'mobx-react-lite'
import {
  tmdbMovieFactory,
  tmdbShowFactory,
  tmdbVideoFromMovieFactory,
  tmdbVideoFromShowFactory,
} from '@reelist/interfaces/tmdb/__factories__/TmdbVideoResponseFactory'
import { TmdbVideoByIdFormatter } from '@reelist/utils/tmdbHelpers/TmdbVideoByIdFormatter'
import inversionContainer from '@reelist/models/inversionContainer'
import Store from '@reelist/models/Store'
import { classFromProps } from '@reelist/utils/ClassHelper'
import { types } from 'mobx-state-tree'

export interface IBaseAwesomeProps {
  x: string
  y: number
  z: boolean
  zz?: boolean
}

// export class Awesome {
//   constructor(props: Awesome) {
//     Object.assign(this, props)
//
//     makeAutoObservable(this)
//   }
//
//   get value() {
//     return this.x // TS finds x on this because of the interface above.
//   }
// }

type PersonProps = {
  firstname: string
  lastname: string
}

type PersonProps2 = {
  firstname: string
  lastname: string
  age: number
}

class Person extends classFromProps<PersonProps2>() {
  isParent = false

  constructor(props: PersonProps, private otherStuff: string) {
    const withAge = { ...props, age: 20 }
    super(withAge)

    const proto = Object.getPrototypeOf(this)

    // @ts-ignore
    console.log(
      'allows make auto observable',
      Object.hasOwnProperty.call(this, '_dangerouslyAllowMakeAutoObservable'),
    )

    console.log('person class', Object.prototype.toString.call(this))

    makeAutoObservable(this)
  }

  get stuff() {
    return this.otherStuff
  }

  get fullname() {
    console.log('calculating fullname')
    return [this.firstname, this.lastname].join(' ')
  }

  static create(props: PersonProps, otherStuff: string) {
    const person = new Person(props, 'hello world')

    console.log('dj dj', Object.hasOwnProperty.call(person, '_dangerouslyAllowMakeAutoObservable'))

    return person
  }
}

const person = new Person({ firstname: 'Tom', lastname: 'Smith' }, 'hello world')

// console.log(person) // ==> Person: {"firstname": "Tom", "lastname": "Smith"}
// console.log(person.fullname) // ==> "Tom Smith"
// console.log(person.stuff) // ==> "hello world"
//
// // @ts-ignore
// console.log(person._dangerouslyAllowMakeAutoObservable) // ==> true

const Square = types
  .model('Square', {
    width: types.number,
  })
  .actions(self => ({
    setWidth(nextNumber: number) {
      self.width = nextNumber
    },
  }))
  .views(self => ({
    // note: this is not a getter! this is just a function that is evaluated
    get surface() {
      return self.width + self.width
    },
  }))

// create a new type, based on Square
const Box = Square.named('Box')
  .views(self => {
    // save the base implementation of surface, again, this is a function.
    // if it was a getter, the getter would be evaluated only once here
    // instead of being able to evaluate dynamically at time-of-use
    const superSurface = self.surface

    return {
      // super contrived override example!
      surface() {
        return superSurface + 1
      },
    }
  })
  .views(self => ({
    volume() {
      return self.surface() + self.width
    },
  }))

// no inheritance, but, union types and code reuse
const Shape = types.union(Box, Square)

describe('VideoList', () => {
  let videoList: VideoList

  beforeEach(async () => {
    videoList = await videoListFactory.create()
    // const store = inversionContainer.get<Store>(Store)
  })

  afterEach(() => {
    videoListFactory.rewindSequence()
  })

  it('runs', async () => {
    autorun(() => {
      const box = Box.create({ width: 2 })
      console.log('box.width:', box.width)
      console.log('box.surface:', box.surface()) // calls Box.surface()
      console.log('box.volume:', box.volume()) // calls Box.volume()

      box.setWidth(4)
      console.log('box.width:', box.width)
      console.log('box.surface(:', box.surface()) // calls Box.surface()
      console.log('box.volume:', box.volume()) // calls Box.volume()
    })

    // autorun(() => {
    //   person.fullname
    //   person.fullname
    //   person.fullname
    //
    //   const person2 = extendObservable(person, {
    //     get info() {
    //       return person.fullname + '!'
    //     },
    //   })
    //
    //   person2.info
    //   person2.info
    //   person2.info
    //   person2.firstname = 'leslie'
    //   person2.fullname
    // })
    mockServer.supabase.patch('/videoLists', {})

    const show = await tmdbVideoFromShowFactory.create()
    const movie = await tmdbVideoFromMovieFactory.create()

    expect(videoList.videoIds).toEqual([])

    await videoList.addOrRemoveVideo(show)

    expect(videoList.videoIds).toEqual([show.videoId])
    const video = await tmdbVideoFromShowFactory.create()

    if (show.isTv) {
      // show.seasonPartials.push(video)
    }
  })
})

// // Only allow this monkey patch if the user has opted in
// const overrideIsPlainObject = Object.hasOwnProperty.call(value, '_dangerouslyAllowMakeAutoObservable')
// if(overrideIsPlainObject) {
//   return true
// }

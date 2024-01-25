import { TmdbPersonType } from '@reelist/interfaces/tmdb/TmdbPersonResponse'
import { TmdbVideoType } from '@reelist/models/Video'

export type OpenGraphType = {
  title: string
  twitterTitle: string
  imageUrl: string
  description: string
  imageWidth: string
  imageHeight: string
}

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

export class TmdbOpenGraphFormatter {
  static async fromVideo(video?: TmdbVideoType): Promise<OpenGraphType | null> {
    if (!video) return null

    const title = 'Explore ' + video.videoName + ' on Reelist'

    return {
      title,
      twitterTitle: title,
      description:
        video.overview || 'See more info about' + video.videoName + 'and its related videos',
      imageUrl: video.posterPath && IMAGE_PATH + video.posterPath,
      imageWidth: '168',
      imageHeight: '300',
    }
  }

  static async fromPerson(person?: TmdbPersonType): Promise<OpenGraphType | null> {
    if (!person) return null

    const title = 'Discover more about ' + person.name + ' on Reelist'

    return {
      title,
      twitterTitle: title,
      description: person.biography || 'See ' + person.name + "'s Filmography",
      imageUrl: person.profilePath && IMAGE_PATH + person.profilePath,
      imageWidth: '168',
      imageHeight: '300',
    }
  }
}

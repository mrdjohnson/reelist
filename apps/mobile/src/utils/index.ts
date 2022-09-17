import moment from 'moment'
import _ from 'lodash'

export const humanizedDuration = (totalMinutes: number | null) => {
  if (totalMinutes === 0) return 'NaN'

  const duration = moment.duration(totalMinutes, 'minutes')

  const years = duration.years()
  const months = duration.months()
  const weeks = duration.weeks()
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()

  const humanize = (time: number, timeLabel: string) => {
    if (time === 0) return null

    // 'years' -> 'year'
    if (time === 1) return `1 ${timeLabel.slice(0, -1)}`

    return time + ' ' + timeLabel
  }

  const times = [
    humanize(years, 'years'),
    humanize(months, 'months'),
    humanize(weeks, 'weeks'),
    humanize(days, 'days'),
    humanize(hours, 'hours'),
    humanize(minutes, 'minutes'),
  ]

  return _.chain(times).compact().join(', ').value()
}

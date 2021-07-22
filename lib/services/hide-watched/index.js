import { List } from 'immutable'

export function isInHideWatched (hideWatched, id) {
  return hideWatched && hideWatched.some(e => e.id === id)
}

export function getHideWatchQueueIds (hideWatched) {
  return hideWatched
    .getIn(['data'], List())
    .map(v => v.id)
}

export default isInHideWatched

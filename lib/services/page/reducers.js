import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_PAGE_LANG:
      return state.set('lang', action.payload)
    case actions.SET_PAGE_TITLE:
      return state.set('title', action.payload)
    case actions.SET_PAGE_PATH:
      return state.set('path', action.payload)
    case actions.SET_PAGE_NEXT_PREV:
      return state.withMutations(mutatableState => mutatableState
        .set('next', action.payload.next)
        .set('prev', action.payload.prev))
    case actions.SET_PAGE_CANONICAL:
      return state.set('canonical', action.payload)
    case actions.SET_PAGE_TOUCH_DEVICE:
      return state.set('isTouch', action.payload)
    case actions.SET_PAGE_SEO:
      return state.withMutations(mutatableState => mutatableState
        .set('path', action.payload.path)
        .set('title', action.payload.title)
        .set('description', action.description)
        .set('noFollow', action.payload.noFollow)
        .set('noIndex', action.payload.noIndex)
        .set('ogTitle', action.payload.ogTitle)
        .set('ogImage', action.payload.ogImage)
        .set('ogType', action.payload.ogType)
        .set('ogUrl', action.payload.ogUrl)
        .set('ogDescription', action.payload.ogDescription)
        .set('ogSiteName', action.payload.ogSiteName)
        .set('canonical', action.payload.canonical)
        .set('prev', action.payload.prev)
        .set('next', action.payload.next))
        .set('twitterCard', action.payload.twitterCard)
        .set('twitterImage', action.payload.twitterImage)
        .set('twitterTitle', action.payload.twitterTitle)
        .set('twitterDescription', action.payload.twitterDescription)
    default:
      return state
  }
}

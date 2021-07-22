import { Map, List } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

const MAX_EVENT_SIZE = 50

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_EVENT_VIDEO_PLAYED:
    case actions.SET_EVENT_SHELF_EXPANDED:
    case actions.SET_EVENT_VIDEO_VISITED:
    case actions.SET_EVENT_SERIES_VISITED:
    case actions.SET_EVENT_PLAYLIST_VIDEO_ADDED:
    case actions.SET_EVENT_VIDEO_VIEW_QUALIFIED:
    case actions.SET_EVENT_GIFT_VIDEO_VIEWED:
    case actions.SET_EVENT_PAGE_VIEWED:
    case actions.SET_EVENT_LOGIN_FAILED:
    case actions.SET_EVENT_ACCOUNT_CANCEL_OFFER_POPUP:
    case actions.SET_EVENT_POPUP_MARKETING_PROMO:
      return state.update('data', List(), (data) => {
        if (data.size > MAX_EVENT_SIZE) {
          // eslint-disable-next-line no-param-reassign
          data = data.unshift()
        }
        return data.push(action.payload.event)
      })
    case actions.SET_EVENT_PAGE_CONTEXT_VIDEO_PLAYED:
      return state.set('pageContext', action.payload)
    default:
      return state
  }
}

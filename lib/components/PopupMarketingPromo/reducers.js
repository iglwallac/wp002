import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_POPUP_MARKETING_PROMO_COOKIE:
      return state.set('cookie', action.payload || null)
    case actions.SET_POPUP_MARKETING_PROMO_VISIBLE:
      return state.set('visible', action.payload || false)
    case actions.SET_POPUP_MARKETING_PROMO_SUCCESS:
      return state.set('success', action.payload)
    default:
      return state
  }
}

import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_COOKIE_CAN_SET_COOKIE:
      return state
        .set('canSetCookie', action.payload)
    default:
      return state
  }
}

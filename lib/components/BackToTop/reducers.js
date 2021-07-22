import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_BACK_TO_TOP_SCROLLING:
      return state.set('scrolling', action.payload)
    default:
      return state
  }
}

import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_PROFITWELL_READY:
      return state
        .set('ready', action.payload)
    case actions.SET_PROFITWELL_STARTED:
      return state
        .set('started', action.payload)
    default:
      return state
  }
}

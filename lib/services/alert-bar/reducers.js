import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_ALERT_BAR_VISIBLE:
      return state.set('visible', action.payload)
    case actions.SET_ALERT_BAR_CLOSED:
      return state.set('closed', action.payload)
    case actions.SET_ALERT_BAR_DATA:
      return state.set('data', action.payload.data)
    case actions.SET_ALERT_BAR_DISMISSED:
      return state.set('dismissed', action.payload)
    default:
      return state
  }
}

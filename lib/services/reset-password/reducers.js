import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.RESET_RESET_PASSWORD:
      return initialState
    case actions.SET_RESET_PASSWORD_DATA:
      return state
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing)
    case actions.SET_RESET_PASSWORD_PROCESSING:
      return state.set('processing', action.payload)
    default:
      return state
  }
}

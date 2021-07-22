import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_CONTINUE_WATCHING_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_CONTINUE_WATCHING_DATA:
      return state
        .set('data', action.payload.data)
        .set('processing', action.payload.processing)
    case actions.RESET_CONTINUE_WATCHING_DATA:
      return initialState
    default:
      return state
  }
}

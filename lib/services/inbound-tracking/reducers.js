import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_INBOUND_TRACKING_PATH:
      return state
        .set('path', action.payload.path)
        .set('processing', action.payload.processing)
    case actions.SET_INBOUND_TRACKING:
    case actions.SET_INBOUND_TRACKING_DATA:
      return state.withMutations(mutableState => mutableState
        .set('data', action.payload.data)
        .set('processing', action.payload.processing))
    case actions.SET_INBOUND_TRACKING_DATA_INITIALIZED:
      return state.withMutations(mutableState => mutableState
        .set('data', action.payload.data)
        .set('initialized', action.payload.initialized)
        .set('processing', action.payload.processing))
    case actions.SET_INBOUND_TRACKING_INITIALIZED:
      return state
        .set('initialized', action.payload.value)
        .set('processing', action.payload.processing)
    case actions.SET_INBOUND_TRACKING_PROCESSING:
      return state.set('processing', action.payload)
    default:
      return state
  }
}

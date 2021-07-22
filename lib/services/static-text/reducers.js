import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATIC_TEXT_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_STATIC_TEXT_DATA:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('data', action.payload.data))
    default:
      return state
  }
}

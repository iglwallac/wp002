import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_HOME_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_HOME_DATA:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing))
    case actions.SET_HOME_SCROLL_TO:
      return state.set('scrollToSection', action.payload)
    default:
      return state
  }
}

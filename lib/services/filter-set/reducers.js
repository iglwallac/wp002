import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_FILTER_SET_DATA:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.filterSet,
        Map(),
        data => data
          .set('data', action.payload.data)
          .set('processing', action.payload.processing),
      ))
    case actions.RESET_FILTER_SET_DATA:
      return initialState
    case actions.SET_FILTER_SET_PROCESSING:
      return state.update(action.payload.filterSet, Map(), data => data.set('processing', action.payload.value))
    case actions.SET_FILTER_SET_EXPANDED:
      return state.set('expanded', action.payload)
    case actions.SET_FILTER_SET_VISIBLE:
      return state.set('visible', action.payload)
    case actions.SET_FILTER_SET_LABELS:
      return state.set('labels', action.payload)
    default:
      return state
  }
}

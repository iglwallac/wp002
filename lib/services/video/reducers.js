import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_VIDEO_DATA:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('data', fromJS(action.payload.data)))
    case actions.SET_VIDEO_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_VIDEO_ID_PATH:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('id', action.payload.id)
        .set('path', action.payload.path))
    case actions.SET_VIDEO_END_STATE_TIMER_VISIBLE:
      return state.setIn(['endState', 'timerVisible'], action.payload)
    default:
      return state
  }
}

import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_USER_VIDEO_DATA:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('data', fromJS(action.payload.data)))
    case actions.SET_USER_VIDEO_ID_PATH:
      return state.withMutations(mutateState => mutateState
        .set('id', action.payload.id)
        .set('path', action.payload.path)
        .set('processing', action.payload.processing))
    case actions.SET_USER_VIDEO_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_USER_VIDEO_DATA_FEATURE_POSITION:
      return state.setIn(['data', 'featurePosition'], action.payload)
    case actions.RESET_USER_VIDEO:
      return initialState
    default:
      return state
  }
}

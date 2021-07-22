import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function mediaReducer (state = initialState, action) {
  switch (action.type) {
    case actions.SET_MEDIA_DATA:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing))
    case actions.SET_MEDIA_ID_PATH:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('id', action.payload.id)
        .set('path', action.payload.path))
    case actions.SET_MEDIA_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_MEDIA_LANG:
      return state.setIn(['data', 'mediaLang'], action.payload)
    case actions.RESET_MEDIA:
      return initialState
    default:
      return state
  }
}

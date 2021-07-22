import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.RESET_TOOL_TIP:
      return initialState
    case actions.SET_TOOL_TIP_VISIBLE:
      return state.update(action.payload.storeKey, Map(), item =>
        item.set('visible', action.payload.visible),
      )
    case actions.TOGGLE_TOOL_TIP_VISIBLE:
      return state.updateIn(
        [action.payload.storeKey, 'visible'],
        visible => !visible,
      )
    case actions.SET_TOOL_TIP_PROCESSING:
      return state.set('processing', action.payload.processing)
    case actions.INIT_TOOL_TIP:
      return state.merge(action.payload.data, Map({
        processing: action.payload.processing,
        initializedLocalStorage: true,
      }))
    case actions.INIT_TOOL_TIP_FEATURE_TRACKING:
      return state.merge(action.payload.data, Map({
        processing: action.payload.processing,
        initializedFeatureTracking: true,
      }))
    default:
      return state
  }
}

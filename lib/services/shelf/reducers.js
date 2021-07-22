import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function shelfReducer (state = initialState, action) {
  switch (action.type) {
    case actions.SET_SHELF_DATA:
    case actions.SET_SHELF_DATA_PLACEHOLDER:
      return state.withMutations(newState => newState
        .set('data', fromJS(action.payload))
        .set('processing', action.processing))
    case actions.SET_SHELF_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_SHELF_LANGUAGE:
      return state.set('language', action.payload)
    case actions.SET_SHELF_ID_TYPE_ACTIVE_TAB_PLACEHOLDER:
      return state.withMutations(newState => newState
        .set('id', action.payload.id)
        .set('type', action.payload.type)
        .set('activeTab', action.payload.activeTab)
        .set('data', fromJS(action.payload.placeholder))
        .set('processing', action.processing))
    case actions.SET_SHELF_VISIBLE_ID:
      return state.withMutations(newState => newState
        .set('visibleId', action.payload.id)
        .set('visible', action.payload.visible))
    case actions.SET_SHELF_VISIBLE:
      return state.set('visible', action.payload)
    case actions.SET_SHELF_ANIMATION_STATE:
      return state.set('animationState', action.payload)
    case actions.SET_SHELF_ACTIVE_TAB:
      return state.set('activeTab', action.payload)
    case actions.SET_SHELF_USER_INFO_PROCESSING:
      return state.set('userInfoProcessing', action.payload)
    case actions.SET_SHELF_USER_PLAYLIST:
      return state.setIn(['data', 'userInfo', 'playlist'], action.payload)
    case actions.APPEND_SHELF_DATA_USER_INFO: {
      const { userInfo, processing } = action.payload
      return state.updateIn(['data'], Map(), (value) => {
        const data = fromJS(userInfo)
        return value.set('userInfo', data.get(0, Map()))
      }).set('userInfoProcessing', processing)
    }
    default:
      return state
  }
}

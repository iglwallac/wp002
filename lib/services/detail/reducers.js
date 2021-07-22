import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_DETAIL_DATA:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('data', fromJS(action.payload.data))
        .set('placeholderExists', false))
    case actions.RESET_DETAIL_DATA:
      return initialState
    case actions.SET_DETAIL_DATA_PLACEHOLDER:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('data', fromJS(action.payload.data))
        .set('placeholderExists', true))
    case actions.SET_DETAIL_ID_PATH_TYPE:
      return state.withMutations(mutateState => mutateState
        .set('id', action.payload.id)
        .set('path', action.payload.path)
        .set('type', action.payload.type)
        .set('processing', action.payload.processing))
    case actions.SET_DETAIL_TILES_ACTIVE_ROW_ID:
      return state.set('tilesActiveRowId', action.payload)
    case actions.SET_DETAIL_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_DETAIL_USER_INFO_PROCESSING:
      return state.set('userInfoProcessing', action.payload)
    case actions.SET_DETAIL_FEATURED_USER_INFO_PROCESSING:
      return state.set('featuredUserInfoProcessing', action.payload)
    case actions.APPEND_DETAIL_DATA_USER_INFO:
      return state.withMutations(mutateState => mutateState
        .set('userInfoProcessing', action.payload.userInfoProcessing)
        .setIn(['data', 'userInfo'], fromJS(action.payload.userInfo).first()))
    case actions.APPEND_DETAIL_DATA_FEATURED_USER_INFO:
      return state.withMutations(mutateState => mutateState
        .set(
          'featuredUserInfoProcessing',
          action.payload.featuredUserInfoProcessing,
        )
        .setIn(
          ['data', 'featuredEpisode', 'userInfo'],
          fromJS(action.payload.userInfo).first(),
        ))
    case actions.DELETE_DETAIL_DATA_USER_INFO:
      return state.deleteIn(['data', 'userInfo'])
    default:
      return state
  }
}

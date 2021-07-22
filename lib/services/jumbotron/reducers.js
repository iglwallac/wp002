import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_JUMBOTRON_DATA:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('processing', action.payload.processing)
          .set('placeholderExists', false)
          .set('data', fromJS(action.payload.data)),
      ))
    case actions.RESET_JUMBOTRON_DATA:
      return initialState
    case actions.SET_JUMBOTRON_DATA_PLACEHOLDER:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('data', fromJS(action.payload.placeholder))
          .set('placeholderExists', true),
      ))
    case actions.SET_JUMBOTRON_PROCESSING:
      return state.setIn(
        [action.payload.storeKey, 'processing'],
        action.payload.processing,
      )
    case actions.SET_JUMBOTRON_ID_TYPE_PATH:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        updateState => updateState
          .set('id', action.payload.id)
          .set('type', action.payload.type)
          .set('path', action.payload.path)
          .set('processing', action.payload.processing),
      ))
    case actions.SET_JUMBOTRON_USER_INFO_PROCESSING:
      return state.setIn(
        [action.payload.storeKey, 'userInfoProcessing'],
        action.payload.userInfoProcessing,
      )
    case actions.SET_JUMBOTRON_USER_PLAYLIST:
      return state.setIn(
        [action.payload.storeKey, 'data', 'userInfo', 'playlist'],
        action.payload.playlist,
      )
    case actions.APPEND_JUMBOTRON_DATA_USER_INFO:
      return state.withMutations(mutateState => mutateState.update(
        action.payload.storeKey,
        Map(),
        (updateState) => {
          const userInfo = fromJS(action.payload.userInfo)
          return updateState
            .set('userInfoProcessing', action.payload.userInfoProcessing)
            .update('data', Map(), value => value.set('userInfo', userInfo.get(0, Map())))
        },
      ))
    default:
      return state
  }
}

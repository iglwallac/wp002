import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_VIDEO_PLAYER_DATA:
      return state.set('data', fromJS(action.payload))
    case actions.SET_VIDEO_PLAYER_LOADING:
      return state.set('loading', action.payload)
    case actions.SET_VIDEO_PLAYER_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_VIDEO_PLAYER_META_VISIBLE:
      return state.set('metaVisible', action.payload)
    case actions.SET_VIDEO_PLAYER_HEARTS_VISIBLE:
      return state.set('heartsVisible', action.payload)
    case actions.TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE:
      return state.update(
        'metaMoreVisible',
        metaMoreVisible => !metaMoreVisible,
      )
    case actions.SET_VIDEO_PLAYER_META_MORE_VISIBLE:
      return state.set('metaMoreVisible', action.payload)
    case actions.SET_VIDEO_PLAYER_META_AUTO_HIDE:
      return state.set('metaAutoHide', action.payload)
    case actions.SET_VIDEO_PLAYER_ENDED:
      return state.set('ended', action.payload.ended)
    case actions.SET_VIDEO_PLAYER_FULL_SCREEN:
      return state.set('fullscreen', action.payload.fullscreen)
    default:
      return state
  }
}
